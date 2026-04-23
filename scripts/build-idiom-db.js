import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");
const IDIOM_DIR = path.join(ROOT_DIR, "tmp", "chinese-idiom");
const DB_DIR = path.join(ROOT_DIR, "frontend", "public", "db");
const DB_PATH = path.join(DB_DIR, "idiom.db");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJson(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function buildIdiomDatabase() {
  console.log("Starting idiom database build...\n");

  ensureDir(DB_DIR);

  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH);
    console.log("Removed existing database file.\n");
  }

  const db = new Database(DB_PATH);

  console.log("Creating tables...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS idioms (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL,
      pinyin TEXT,
      explanation TEXT,
      source TEXT,
      length INTEGER,
      abbreviation TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS allusions (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL,
      allusion TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL,
      story TEXT
    )
  `);

  db.exec("CREATE INDEX IF NOT EXISTS idx_idioms_word ON idioms(word)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_allusions_word ON allusions(word)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_stories_word ON stories(word)");
  console.log("Tables created.\n");

  console.log("Loading JSON data...");

  const idioms = loadJson(path.join(IDIOM_DIR, "chinese-idiom_table_idiom.json"));
  const allusions = loadJson(path.join(IDIOM_DIR, "chinese-idiom_table_idiom_allusion.json"));
  const stories = loadJson(path.join(IDIOM_DIR, "chinese-idiom_table_idiom_story.json"));

  console.log(`Loaded ${idioms.length} idioms`);
  console.log(`Loaded ${allusions.length} allusions`);
  console.log(`Loaded ${stories.length} stories\n`);

  const insertIdiom = db.transaction((items) => {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO idioms (id, word, pinyin, explanation, source, length, abbreviation) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const item of items) {
      stmt.run([
        item.id,
        item.word,
        item.pinyin || null,
        item.explanation || null,
        item.source || null,
        item.length || null,
        item.abbreviation || null,
      ]);
    }
    stmt.free?.();
  });

  const insertAllusion = db.transaction((items) => {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO allusions (id, word, allusion) VALUES (?, ?, ?)"
    );
    for (const item of items) {
      stmt.run([item.id, item.word, item.allusion || null]);
    }
    stmt.free?.();
  });

  const insertStory = db.transaction((items) => {
    const stmt = db.prepare(
      "INSERT OR REPLACE INTO stories (id, word, story) VALUES (?, ?, ?)"
    );
    for (const item of items) {
      stmt.run([item.id, item.word, item.story || null]);
    }
    stmt.free?.();
  });

  console.log("Inserting idioms...");
  insertIdiom(idioms);
  console.log(`Inserted ${idioms.length} idioms\n`);

  console.log("Inserting allusions...");
  insertAllusion(allusions);
  console.log(`Inserted ${allusions.length} allusions\n`);

  console.log("Inserting stories...");
  insertStory(stories);
  console.log(`Inserted ${stories.length} stories\n`);

  const idiomCount = db.prepare("SELECT COUNT(*) as count FROM idioms").get();
  const allusionCount = db.prepare("SELECT COUNT(*) as count FROM allusions").get();
  const storyCount = db.prepare("SELECT COUNT(*) as count FROM stories").get();

  console.log("Database statistics:");
  console.log(`  Total idioms: ${idiomCount.count}`);
  console.log(`  Total allusions: ${allusionCount.count}`);
  console.log(`  Total stories: ${storyCount.count}\n`);

  db.close();

  const dbSize = readFileSync(DB_PATH).length;
  console.log(`Database file: ${DB_PATH}`);
  console.log(`Database size: ${(dbSize / 1024 / 1024).toFixed(2)} MB\n`);

  console.log("Idiom database build completed successfully!");
}

buildIdiomDatabase();