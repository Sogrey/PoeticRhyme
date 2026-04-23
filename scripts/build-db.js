import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "public", "data");
const DB_DIR = path.join(ROOT_DIR, "frontend", "public", "db");

const DB_PATH = path.join(DB_DIR, "poetry.db");

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function loadJson(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function buildDatabase() {
  console.log("Starting database build...\n");

  ensureDir(DB_DIR);

  if (existsSync(DB_PATH)) {
    unlinkSync(DB_PATH);
    console.log("Removed existing database file.\n");
  }

  const db = new Database(DB_PATH);

  console.log("Creating tables...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS poems (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      dynasty TEXT NOT NULL,
      rhythmic TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      dynasty TEXT NOT NULL
    )
  `);

  db.exec("CREATE INDEX IF NOT EXISTS idx_poems_author ON poems(author)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_poems_dynasty ON poems(dynasty)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_authors_dynasty ON authors(dynasty)");
  console.log("Tables created.\n");

  const poemsStmt = db.prepare(
    "INSERT OR REPLACE INTO poems (id, title, content, author, dynasty, rhythmic) VALUES (?, ?, ?, ?, ?, ?)",
  );

  const authorsStmt = db.prepare(
    "INSERT OR REPLACE INTO authors (id, name, description, dynasty) VALUES (?, ?, ?, ?)",
  );

  const insertPoems = db.transaction((poems) => {
    for (const poem of poems) {
      poemsStmt.run([
        poem.id,
        poem.title,
        poem.content,
        poem.author,
        poem.dynasty,
        poem.rhythmic || null,
      ]);
    }
  });

  const insertAuthors = db.transaction((authors) => {
    for (const author of authors) {
      authorsStmt.run([author.id, author.name, author.description || null, author.dynasty]);
    }
  });

  console.log("Loading JSON data...");

  const authors = loadJson(path.join(DATA_DIR, "authors.json"));
  console.log(`Loaded ${authors.length} authors`);

  const poems1 = loadJson(path.join(DATA_DIR, "poems.1.json"));
  const poems2 = loadJson(path.join(DATA_DIR, "poems.2.json"));
  const poems3 = loadJson(path.join(DATA_DIR, "poems.3.json"));
  const allPoems = [...poems1, ...poems2, ...poems3];
  console.log(`Loaded ${allPoems.length} poems\n`);

  console.log("Inserting authors into database...");
  insertAuthors(authors);
  console.log(`Inserted ${authors.length} authors\n`);

  console.log("Inserting poems into database...");
  insertPoems(allPoems);
  console.log(`Inserted ${allPoems.length} poems\n`);

  poemsStmt.free?.();
  authorsStmt.free?.();

  const poemCount = db.prepare("SELECT COUNT(*) as count FROM poems").get();
  const authorCount = db.prepare("SELECT COUNT(*) as count FROM authors").get();

  console.log("Database statistics:");
  console.log(`  Total poems: ${poemCount.count}`);
  console.log(`  Total authors: ${authorCount.count}\n`);

  db.close();

  const dbSize = readFileSync(DB_PATH).length;
  console.log(`Database file: ${DB_PATH}`);
  console.log(`Database size: ${(dbSize / 1024 / 1024).toFixed(2)} MB\n`);

  console.log("Database build completed successfully!");
}

buildDatabase();
