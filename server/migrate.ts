import { readFile } from 'node:fs/promises';
import { createPool, type Pool } from 'mysql2/promise';
import { databaseOptions } from './config.js';
export async function migrate(pool: Pool) {
  // Single additive, repeatable migration; no seeds or data deletion.
  await pool.query(
    await readFile(
      new URL('./migrations/001-signatures.sql', import.meta.url),
      'utf8',
    ),
  );
}
if (process.argv[1]?.endsWith('/migrate.ts')) {
  const pool = createPool(databaseOptions());
  try {
    await migrate(pool);
    console.log('Portfolio migration applied.');
  } catch {
    console.error('Portfolio migration failed; check DB configuration.');
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
