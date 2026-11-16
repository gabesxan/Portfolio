import { createPool } from 'mysql2/promise';
import { databaseOptions } from './config.js';
const pool = createPool(databaseOptions());
try {
  await pool.execute(
    'DELETE FROM signatures WHERE created_at < UTC_TIMESTAMP() - INTERVAL 365 DAY',
  );
  console.log('Expired portfolio signatures removed.');
} catch {
  console.error('Retention cleanup failed.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
