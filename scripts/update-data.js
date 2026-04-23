import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runScript(scriptName) {
  const { downloadData } = await import(scriptName);
  return downloadData();
}

async function runPreprocess() {
  const { preprocessData } = await import("./preprocess-data.js");
  return preprocessData();
}

async function updateAll() {
  console.log("========================================");
  console.log("  Poetry Data Update Script");
  console.log("  一键更新诗词数据");
  console.log("========================================\n");

  try {
    console.log("\n========================================");
    console.log("Step 1: Fetching data from GitHub...");
    console.log("========================================\n");
    await runScript("./fetch-data.js");

    console.log("\n========================================");
    console.log("Step 2: Processing and optimizing data...");
    console.log("========================================\n");
    await runPreprocess();

    console.log("\n========================================");
    console.log("  ✓ All data updated successfully!");
    console.log("========================================\n");
    console.log("Next steps:");
    console.log("1. Check public/data/ for processed JSON files");
    console.log('2. Run "pnpm dev" to start the development server');
    console.log("3. The app will automatically sync data to IndexedDB on first load\n");
  } catch (err) {
    console.error("\n========================================");
    console.error("  ✗ Data update failed!");
    console.error("========================================\n");
    console.error(err);
    process.exit(1);
  }
}

updateAll();
