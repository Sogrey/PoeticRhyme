import {
  initDatabase,
  getPoems,
  getPoemById,
  getAuthors,
  searchPoems,
  getPoemsByDynasty,
  getPoemsByAuthor,
  getStats,
  getPoemCount,
  getAuthorCount,
  type Poem,
  type Author,
  type Stats,
} from '../utils/sqliteDb';

let dbInitialized = false;

export async function initializeDb(): Promise<void> {
  if (dbInitialized) return;
  await initDatabase();
  dbInitialized = true;
}

export const apiService = {
  async getPoems(params: { page?: number; limit?: number; dynasty?: string; author?: string }) {
    await initializeDb();

    const page = params.page || 1;
    const limit = params.limit || 20;

    let poems: Poem[];

    if (params.dynasty) {
      poems = getPoemsByDynasty(params.dynasty, page, limit);
    } else if (params.author) {
      poems = getPoemsByAuthor(params.author, page, limit);
    } else {
      poems = getPoems(page, limit);
    }

    const total = getPoemCount();

    return {
      total,
      page,
      limit,
      data: poems,
    };
  },

  async getPoemById(id: string) {
    await initializeDb();
    return getPoemById(id);
  },

  async getAuthors(params: { page?: number; limit?: number; dynasty?: string }) {
    await initializeDb();

    const page = params.page || 1;
    const limit = params.limit || 20;
    const authors = getAuthors(page, limit);
    const total = getAuthorCount();

    return {
      total,
      page,
      limit,
      data: authors,
    };
  },

  async getAuthorById(id: string) {
    await initializeDb();
    const authors = getAuthors(1, 1000);
    return authors.find(a => a.id === id) || null;
  },

  async getStats() {
    await initializeDb();
    return getStats();
  },

  async search(keyword: string, limit: number = 50) {
    await initializeDb();
    const poems = searchPoems(keyword, limit);
    return {
      total: poems.length,
      data: poems,
    };
  },

  async getHealth() {
    return { status: 'ok' };
  },
};

export type { Poem, Author, Stats };