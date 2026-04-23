import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TMP_DIR = path.join(__dirname, "..", "tmp");
const PUBLIC_DIR = path.join(__dirname, "..", "public", "data");
const REPO_DIR = path.join(TMP_DIR, "chinese-poetry");
const ZIP_FILE = path.join(TMP_DIR, "chinese-poetry-master.zip");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function detectEnvironment() {
  const platform = process.platform;
  const shell = process.env.SHELL || "";

  if (platform === "win32") {
    if (shell.includes("bash") || shell.includes("msys") || shell.includes("git")) {
      return "git_bash";
    }
    return "powershell";
  }

  if (platform === "darwin") return "macos";
  if (platform === "linux") return "linux";

  return "unknown";
}

function extractWithPowerShell(zipFile, destDir) {
  return new Promise((resolve, reject) => {
    console.log("Extracting with PowerShell (.NET)...");

    const escapedZip = zipFile.replace(/\\/g, "\\\\").replace(/'/g, "''");
    const escapedDest = destDir.replace(/\\/g, "\\\\").replace(/'/g, "''");

    const command = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${escapedZip}', '${escapedDest}')`;

    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
      { shell: true, stdio: "inherit" },
    );

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`PowerShell failed with code ${code}`));
    });
    child.on("error", reject);
  });
}

function extractWithTar(zipFile, destDir) {
  return new Promise((resolve, reject) => {
    console.log("Extracting with tar...");
    const child = spawn("tar", ["-xzf", zipFile, "-C", destDir], {
      shell: true,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`tar failed with code ${code}`));
    });
    child.on("error", reject);
  });
}

function extractWithUnzip(zipFile, destDir) {
  return new Promise((resolve, reject) => {
    console.log("Extracting with unzip...");
    const child = spawn("unzip", ["-o", zipFile, "-d", destDir], {
      shell: true,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`unzip failed with code ${code}`));
    });
    child.on("error", reject);
  });
}

function extractWith7z(zipFile, destDir) {
  return new Promise((resolve, reject) => {
    console.log("Extracting with 7z...");
    const child = spawn("7z", ["x", zipFile, `-o${destDir}`, "-y"], {
      shell: true,
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`7z failed with code ${code}`));
    });
    child.on("error", reject);
  });
}

function copyDirSync(src, dest) {
  ensureDir(dest);
  const items = fs.readdirSync(src);
  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function extractZip(zipFile, destDir) {
  const env = detectEnvironment();
  console.log(`Detected environment: ${env}`);

  if (env === "git_bash") {
    try {
      await extractWithTar(zipFile, destDir);
      return;
    } catch {
      console.warn("tar failed, trying unzip...");
      await extractWithUnzip(zipFile, destDir);
      return;
    }
  }

  if (env === "macos" || env === "linux") {
    try {
      await extractWithUnzip(zipFile, destDir);
      return;
    } catch {
      console.warn("unzip failed, trying tar...");
      await extractWithTar(zipFile, destDir);
      return;
    }
  }

  if (env === "powershell") {
    try {
      await extractWithPowerShell(zipFile, destDir);
      return;
    } catch (err) {
      console.warn("PowerShell .NET failed, trying 7z...", err);
      try {
        await extractWith7z(zipFile, destDir);
        return;
      } catch {
        console.warn("7z also failed");
      }
    }
  }

  const methods = [
    { name: "tar", fn: extractWithTar },
    { name: "unzip", fn: extractWithUnzip },
    { name: "7z", fn: extractWith7z },
  ];

  for (const method of methods) {
    try {
      console.log(`Trying ${method.name}...`);
      await method.fn(zipFile, destDir);
      return;
    } catch (err) {
      console.warn(`${method.name} failed: ${err.message}`);
    }
  }

  throw new Error("All extraction methods failed");
}

async function extractAndSetup() {
  ensureDir(TMP_DIR);

  const extractedDir = path.join(TMP_DIR, "chinese-poetry-master");

  if (fs.existsSync(REPO_DIR)) {
    console.log("Repository already exists, skipping extraction.");
    return;
  }

  if (!fs.existsSync(ZIP_FILE)) {
    console.error("Zip file not found. Please download it first.");
    console.log(
      "URL: https://github.com/chinese-poetry/chinese-poetry/archive/refs/heads/master.zip",
    );
    process.exit(1);
  }

  await extractZip(ZIP_FILE, TMP_DIR);
  console.log("Extraction completed!");

  if (fs.existsSync(extractedDir) && extractedDir !== REPO_DIR) {
    console.log("Moving extracted files to target directory...");
    try {
      fs.rmSync(REPO_DIR, { recursive: true, force: true });
      fs.renameSync(extractedDir, REPO_DIR);
      console.log("Renamed to chinese-poetry");
    } catch (err) {
      console.warn("Rename failed, trying copy instead...", err);
      try {
        copyDirSync(extractedDir, REPO_DIR);
        fs.rmSync(extractedDir, { recursive: true, force: true });
        console.log("Copied and cleaned up");
      } catch (copyErr) {
        console.error("Copy also failed:", copyErr.message);
        console.log("Please manually move or rename the directory:");
        console.log(`  From: ${extractedDir}`);
        console.log(`  To: ${REPO_DIR}`);
      }
    }
  }

  if (fs.existsSync(ZIP_FILE)) {
    fs.unlinkSync(ZIP_FILE);
    console.log("Cleaned up zip file");
  }
}

async function downloadData() {
  console.log("========================================");
  console.log("Extracting and setting up data...");
  console.log("========================================\n");

  await extractAndSetup();

  console.log("\n========================================");
  console.log("Repository structure:");
  console.log("========================================");

  const items = fs.readdirSync(REPO_DIR);
  items.forEach((item) => {
    const itemPath = path.join(REPO_DIR, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      console.log(`📁 ${item}/`);
      const subItems = fs.readdirSync(itemPath).slice(0, 5);
      subItems.forEach((sub) => console.log(`   - ${sub}`));
      if (fs.readdirSync(itemPath).length > 5) {
        console.log(`   ... and ${fs.readdirSync(itemPath).length - 5} more files`);
      }
    } else {
      console.log(`📄 ${item}`);
    }
  });

  console.log("\n========================================");
  console.log("Data files available at:");
  console.log(REPO_DIR);
  console.log("========================================\n");

  console.log('Next step: Run "npm run data:preprocess" to process the data\n');

  return REPO_DIR;
}

if (process.argv[1] && process.argv[1].includes("fetch-data.js")) {
  downloadData().catch(console.error);
}

export { downloadData, REPO_DIR, TMP_DIR, PUBLIC_DIR };
