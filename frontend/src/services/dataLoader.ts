import { initDatabase } from '../utils/sqliteDb';

export async function loadInitialData(): Promise<void> {
  await initDatabase();
  console.log('Database initialized from pre-built file');
}
