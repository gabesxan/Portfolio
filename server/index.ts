import { createPool } from 'mysql2/promise';
import { buildApp } from './app.js';
import { databaseOptions, requireAdminSecret } from './config.js';
import { mysqlRepository } from './repository.js';
const pool = createPool(databaseOptions());
const app = await buildApp(
  mysqlRepository(pool),
  requireAdminSecret(process.env.ADMIN_SECRET),
);
app.addHook('onClose', () => pool.end());
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, () => {
    void app.close();
  });
try {
  await pool.query('SELECT 1');
  await app.listen({
    port: Number(process.env.API_PORT ?? 3001),
    host: '127.0.0.1',
  });
  console.log('Portfolio API listening on loopback.');
} catch {
  console.error(
    'Portfolio API startup failed; check environment and migrations.',
  );
  await app.close();
  process.exitCode = 1;
}
