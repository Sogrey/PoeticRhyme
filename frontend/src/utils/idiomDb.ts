import type { Database as SqlJsDatabase } from 'sql.js';

export interface Idiom {
  id: number;
  word: string;
  pinyin?: string;
  explanation?: string;
  source?: string;
  length?: number;
  abbreviation?: string;
}

export interface IdiomDetail extends Idiom {
  allusion?: string;
  story?: string;
}

let db: SqlJsDatabase | null = null;

export async function initIdiomDatabase(): Promise<void> {
  const initSqlJs = (await import('sql.js')).default;

  const SQL = await initSqlJs({
    locateFile: () => '/PoeticRhyme/sql-wasm.wasm',
  });

  const basePath = import.meta.env.BASE_URL;
  const dbPath = basePath === '/PoeticRhyme' ? '/PoeticRhyme/db/idiom.db' : '/db/idiom.db';

  const response = await fetch(dbPath);
  if (!response.ok) {
    throw new Error(`Failed to load idiom database: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  console.log('Idiom database loaded from pre-built file');
}

export function getIdiomDb(): SqlJsDatabase {
  if (!db) throw new Error('Idiom database not initialized');
  return db;
}

export function getIdioms(page: number = 1, limit: number = 20): Idiom[] {
  if (!db) throw new Error('Idiom database not initialized');

  const offset = (page - 1) * limit;
  const stmt = db.prepare(
    'SELECT id, word, pinyin, explanation, source, length, abbreviation FROM idioms ORDER BY id LIMIT ? OFFSET ?'
  );
  stmt.bind([limit, offset]);

  const idioms: Idiom[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    idioms.push({
      id: row.id as number,
      word: row.word as string,
      pinyin: row.pinyin as string | undefined,
      explanation: row.explanation as string | undefined,
      source: row.source as string | undefined,
      length: row.length as number | undefined,
      abbreviation: row.abbreviation as string | undefined,
    });
  }
  stmt.free();

  return idioms;
}

export function getIdiomByWord(word: string): IdiomDetail | null {
  if (!db) throw new Error('Idiom database not initialized');

  const idiomStmt = db.prepare(
    'SELECT id, word, pinyin, explanation, source, length, abbreviation FROM idioms WHERE word = ?'
  );
  idiomStmt.bind([word]);

  let idiom: IdiomDetail | null = null;
  if (idiomStmt.step()) {
    const row = idiomStmt.getAsObject() as Record<string, unknown>;
    idiom = {
      id: row.id as number,
      word: row.word as string,
      pinyin: row.pinyin as string | undefined,
      explanation: row.explanation as string | undefined,
      source: row.source as string | undefined,
      length: row.length as number | undefined,
      abbreviation: row.abbreviation as string | undefined,
    };
  }
  idiomStmt.free();

  if (!idiom) return null;

  const allusionStmt = db.prepare('SELECT allusion FROM allusions WHERE word = ?');
  allusionStmt.bind([word]);
  if (allusionStmt.step()) {
    const row = allusionStmt.getAsObject() as Record<string, unknown>;
    idiom.allusion = row.allusion as string;
  }
  allusionStmt.free();

  const storyStmt = db.prepare('SELECT story FROM stories WHERE word = ?');
  storyStmt.bind([word]);
  if (storyStmt.step()) {
    const row = storyStmt.getAsObject() as Record<string, unknown>;
    idiom.story = row.story as string;
  }
  storyStmt.free();

  return idiom;
}

export function getIdiomById(id: number): IdiomDetail | null {
  if (!db) throw new Error('Idiom database not initialized');

  const stmt = db.prepare(
    'SELECT word FROM idioms WHERE id = ?'
  );
  stmt.bind([id]);

  let word: string | null = null;
  if (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    word = row.word as string;
  }
  stmt.free();

  if (!word) return null;
  return getIdiomByWord(word);
}

export function searchIdioms(keyword: string, limit: number = 50): Idiom[] {
  if (!db) throw new Error('Idiom database not initialized');

  const stmt = db.prepare(
    'SELECT id, word, pinyin, explanation, source, length, abbreviation FROM idioms WHERE word LIKE ? OR pinyin LIKE ? OR explanation LIKE ? LIMIT ?'
  );
  const pattern = `%${keyword}%`;
  stmt.bind([pattern, pattern, pattern, limit]);

  const idioms: Idiom[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    idioms.push({
      id: row.id as number,
      word: row.word as string,
      pinyin: row.pinyin as string | undefined,
      explanation: row.explanation as string | undefined,
      source: row.source as string | undefined,
      length: row.length as number | undefined,
      abbreviation: row.abbreviation as string | undefined,
    });
  }
  stmt.free();

  return idioms;
}

export function getIdiomCount(): number {
  if (!db) throw new Error('Idiom database not initialized');
  const result = db.exec('SELECT COUNT(*) FROM idioms');
  return result[0]?.values[0]?.[0] as number || 0;
}