import type { Database as SqlJsDatabase } from 'sql.js';

export interface Poem {
  id: string;
  title: string;
  content: string;
  author: string;
  dynasty: string;
  rhythmic?: string;
}

export interface Author {
  id: string;
  name: string;
  description?: string;
  dynasty: string;
}

export interface Stats {
  poem_count: number;
  author_count: number;
  dynasties: string[];
}

let db: SqlJsDatabase | null = null;

export async function initDatabase(): Promise<void> {
  const initSqlJs = (await import('sql.js')).default;

  const SQL = await initSqlJs({
    locateFile: () => '/PoeticRhyme/sql-wasm.wasm',
  });

  const basePath = import.meta.env.BASE_URL;
  const dbPath = basePath === '/PoeticRhyme' ? '/PoeticRhyme/db/poetry.db' : '/db/poetry.db';

  const response = await fetch(dbPath);
  if (!response.ok) {
    throw new Error(`Failed to load database: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  console.log('Database loaded from pre-built file');
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function getPoems(page: number = 1, limit: number = 20): Poem[] {
  if (!db) throw new Error('Database not initialized');

  const offset = (page - 1) * limit;
  const stmt = db.prepare(
    'SELECT id, title, content, author, dynasty, rhythmic FROM poems ORDER BY id LIMIT ? OFFSET ?'
  );
  stmt.bind([limit, offset]);

  const poems: Poem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    poems.push({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      author: row.author as string,
      dynasty: row.dynasty as string,
      rhythmic: row.rhythmic as string | undefined,
    });
  }
  stmt.free();

  return poems;
}

export function getPoemById(id: string): Poem | null {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare(
    'SELECT id, title, content, author, dynasty, rhythmic FROM poems WHERE id = ?'
  );
  stmt.bind([id]);

  let poem: Poem | null = null;
  if (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    poem = {
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      author: row.author as string,
      dynasty: row.dynasty as string,
      rhythmic: row.rhythmic as string | undefined,
    };
  }
  stmt.free();

  return poem;
}

export function getAuthors(page: number = 1, limit: number = 20): Author[] {
  if (!db) throw new Error('Database not initialized');

  const offset = (page - 1) * limit;
  const stmt = db.prepare(
    'SELECT id, name, description, dynasty FROM authors ORDER BY name LIMIT ? OFFSET ?'
  );
  stmt.bind([limit, offset]);

  const authors: Author[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    authors.push({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | undefined,
      dynasty: row.dynasty as string,
    });
  }
  stmt.free();

  return authors;
}

export function searchPoems(keyword: string, limit: number = 50): Poem[] {
  if (!db) throw new Error('Database not initialized');

  const pattern = `%${keyword}%`;
  const stmt = db.prepare(
    'SELECT id, title, content, author, dynasty, rhythmic FROM poems WHERE title LIKE ? OR content LIKE ? OR author LIKE ? LIMIT ?'
  );
  stmt.bind([pattern, pattern, pattern, limit]);

  const poems: Poem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    poems.push({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      author: row.author as string,
      dynasty: row.dynasty as string,
      rhythmic: row.rhythmic as string | undefined,
    });
  }
  stmt.free();

  return poems;
}

export function getPoemsByDynasty(dynasty: string, page: number = 1, limit: number = 20): Poem[] {
  if (!db) throw new Error('Database not initialized');

  const offset = (page - 1) * limit;
  const stmt = db.prepare(
    'SELECT id, title, content, author, dynasty, rhythmic FROM poems WHERE dynasty = ? ORDER BY id LIMIT ? OFFSET ?'
  );
  stmt.bind([dynasty, limit, offset]);

  const poems: Poem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    poems.push({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      author: row.author as string,
      dynasty: row.dynasty as string,
      rhythmic: row.rhythmic as string | undefined,
    });
  }
  stmt.free();

  return poems;
}

export function getPoemsByAuthor(author: string, page: number = 1, limit: number = 20): Poem[] {
  if (!db) throw new Error('Database not initialized');

  const offset = (page - 1) * limit;
  const stmt = db.prepare(
    'SELECT id, title, content, author, dynasty, rhythmic FROM poems WHERE author = ? ORDER BY id LIMIT ? OFFSET ?'
  );
  stmt.bind([author, limit, offset]);

  const poems: Poem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as Record<string, unknown>;
    poems.push({
      id: row.id as string,
      title: row.title as string,
      content: row.content as string,
      author: row.author as string,
      dynasty: row.dynasty as string,
      rhythmic: row.rhythmic as string | undefined,
    });
  }
  stmt.free();

  return poems;
}

export function getStats(): Stats {
  if (!db) throw new Error('Database not initialized');

  const poemCount = db.exec('SELECT COUNT(*) FROM poems')[0]?.values[0]?.[0] as number || 0;
  const authorCount = db.exec('SELECT COUNT(*) FROM authors')[0]?.values[0]?.[0] as number || 0;

  const dynastyResult = db.exec('SELECT DISTINCT dynasty FROM poems ORDER BY dynasty');
  const dynasties = dynastyResult[0]?.values.map(row => row[0] as string) || [];

  return {
    poem_count: poemCount,
    author_count: authorCount,
    dynasties,
  };
}

export function getPoemCount(): number {
  if (!db) throw new Error('Database not initialized');
  const result = db.exec('SELECT COUNT(*) FROM poems');
  return result[0]?.values[0]?.[0] as number || 0;
}

export function getAuthorCount(): number {
  if (!db) throw new Error('Database not initialized');
  const result = db.exec('SELECT COUNT(*) FROM authors');
  return result[0]?.values[0]?.[0] as number || 0;
}
