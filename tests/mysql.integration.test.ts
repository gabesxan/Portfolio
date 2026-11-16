// @vitest-environment node
import { it, expect } from 'vitest';
import { createPool } from 'mysql2/promise';
import { buildApp } from '../server/app';
import { mysqlRepository } from '../server/repository';
import { migrate } from '../server/migrate';
import type { Signature, SignaturePage } from '../src/services/types';
const url = process.env.TEST_DATABASE_URL;
it.skipIf(!url)(
  'persists text/drawing across independent MySQL pools and API instances, paginates and moderates',
  async () => {
    const parsed = new URL(url!);
    if (!/^\/portfolio(?:_[a-z0-9]+)*_test$/.test(parsed.pathname))
      throw new Error(
        'TEST_DATABASE_URL must target a portfolio_*test database.',
      );
    const options = {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      supportBigNumbers: true,
      bigNumberStrings: true,
      dateStrings: true,
      timezone: 'Z',
      connectionLimit: 2,
    };
    const poolA = createPool(options),
      poolB = createPool(options);
    const secret = 'portfolio-real-db-test-secret-32-characters';
    const appA = await buildApp(mysqlRepository(poolA), secret),
      appB = await buildApp(mysqlRepository(poolB), secret);
    const ids: string[] = [];
    try {
      await migrate(poolA);
      await migrate(poolA);
      for (const kind of ['text', 'drawing'] as const) {
        const payload = {
          name: `Integration ${kind}`,
          kind,
          color: '#153ed5',
          font: 'marker',
          ...(kind === 'drawing'
            ? {
                strokes: [
                  {
                    width: 3,
                    points: [
                      { x: 0.1, y: 0.2 },
                      { x: 0.5, y: 0.8 },
                    ],
                  },
                ],
              }
            : {}),
        };
        const res = await appA.inject({
          method: 'POST',
          url: '/api/signatures',
          payload,
        });
        expect(res.statusCode).toBe(201);
        const item = res.json<{ data: Signature }>().data;
        ids.push(item.id);
        expect(item.createdAt).toMatch(/Z$/);
        expect(item.kind).toBe(kind);
      }
      const list = await appB.inject('/api/signatures?limit=1');
      expect(list.statusCode).toBe(200);
      const first = list.json<SignaturePage>();
      expect(first.data[0].id).toBe(ids[1]);
      expect(first.data[0].strokes?.[0].points[1]).toEqual({ x: 0.5, y: 0.8 });
      expect(first.pagination.hasMore).toBe(true);
      const next = (
        await appB.inject(
          `/api/signatures?limit=1&cursor=${first.pagination.nextCursor}`,
        )
      ).json<SignaturePage>();
      expect(next.data[0].id).toBe(ids[0]);
      expect(next.data[0].strokes).toBeNull();
      expect(
        (
          await appB.inject({
            method: 'DELETE',
            url: `/api/admin/signatures/${ids[0]}`,
          })
        ).statusCode,
      ).toBe(401);
      expect(
        (
          await appB.inject({
            method: 'DELETE',
            url: `/api/admin/signatures/${ids[0]}`,
            headers: { authorization: `Bearer ${secret}` },
          })
        ).statusCode,
      ).toBe(204);
      expect(
        (await appA.inject('/api/signatures'))
          .json<SignaturePage>()
          .data.some((x) => x.id === ids[0]),
      ).toBe(false);
      // Expired content is excluded before cleanup runs.
      await poolA.execute(
        'UPDATE signatures SET created_at = UTC_TIMESTAMP() - INTERVAL 366 DAY WHERE id=?',
        [ids[1]],
      );
      expect(
        (await appB.inject('/api/signatures'))
          .json<SignaturePage>()
          .data.some((x) => x.id === ids[1]),
      ).toBe(false);
    } finally {
      for (const id of ids)
        await poolA.execute('DELETE FROM signatures WHERE id=?', [id]);
      await Promise.all([appA.close(), appB.close()]);
      await Promise.all([poolA.end(), poolB.end()]);
    }
  },
  20000,
);
