import type { PoolOptions } from 'mysql2/promise';
export function databaseOptions(env = process.env): PoolOptions {
  const database = env.DB_NAME ?? 'portfolio';
  if (!/^portfolio(?:_[a-z0-9]+)*$/.test(database))
    throw new Error('DB_NAME must belong to portfolio.');
  if (!env.DB_USER || !env.DB_PASSWORD)
    throw new Error('DB_USER and DB_PASSWORD are required.');
  const port = Number(env.DB_PORT ?? 3307);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('Invalid DB_PORT.');
  return {
    host: env.DB_HOST ?? '127.0.0.1',
    port,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    connectionLimit: 5,
    queueLimit: 20,
    connectTimeout: 5000,
    charset: 'utf8mb4',
    timezone: 'Z',
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    multipleStatements: false,
  };
}
export function requireAdminSecret(secret: string | undefined): string {
  if (!secret || secret.trim().length < 32 || secret.includes('change-me'))
    throw new Error('Set a unique ADMIN_SECRET of at least 32 characters.');
  return secret;
}
