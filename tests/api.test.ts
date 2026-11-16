// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildApp } from '../server/app';
import type { SignatureRepository } from '../server/repository';
import type { SignatureInput } from '../src/services/types';
import { databaseOptions, requireAdminSecret } from '../server/config';
const secret = 'portfolio-unit-test-secret-at-least-32-characters';
const text: SignatureInput = {
  name: 'Visitor',
  kind: 'text',
  color: '#153ed5',
  font: 'marker',
};
const drawing: SignatureInput = {
  ...text,
  kind: 'drawing',
  strokes: [
    {
      width: 4,
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ],
    },
  ],
};
const apps: Awaited<ReturnType<typeof buildApp>>[] = [];
afterEach(async () => {
  await Promise.all(apps.splice(0).map((a) => a.close()));
});
async function setup() {
  const repo: SignatureRepository = {
    list: vi.fn().mockResolvedValue({
      data: [],
      pagination: { limit: 12, nextCursor: null, hasMore: false },
    }),
    create: vi.fn().mockImplementation(async (input) => ({
      ...input,
      id: '1',
      strokes: input.strokes ?? null,
      createdAt: '2026-11-16T12:00:00.000Z',
    })),
    remove: vi.fn().mockResolvedValue(true),
  };
  const app = await buildApp(repo, secret);
  apps.push(app);
  return { app, repo };
}
describe('mural trust boundary', () => {
  it('lists a bounded cursor page and passes exact string IDs', async () => {
    const { app, repo } = await setup();
    const res = await app.inject(
      '/api/signatures?limit=24&cursor=9007199254740993',
    );
    expect(res.statusCode).toBe(200);
    expect(repo.list).toHaveBeenCalledWith(24, '9007199254740993');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
  it.each([
    'limit=0',
    'limit=25',
    'limit=1.2',
    'limit=01',
    'cursor=0',
    'cursor=-1',
    'cursor=1%20OR%201=1',
    'extra=x',
  ])('rejects invalid query %s', async (q) => {
    const { app, repo } = await setup();
    const res = await app.inject('/api/signatures?' + q);
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
    expect(repo.list).not.toHaveBeenCalled();
  });
  it.each([text, drawing])(
    'publishes valid $kind only after repository confirmation',
    async (payload) => {
      const { app, repo } = await setup();
      const res = await app.inject({
        method: 'POST',
        url: '/api/signatures',
        payload: { ...payload, name: '  Visitor  ' },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json().data.name).toBe('Visitor');
      expect(repo.create).toHaveBeenCalledWith({ ...payload, name: 'Visitor' });
    },
  );
  it.each([
    { ...text, name: ' ' },
    { ...text, name: 'x'.repeat(41) },
    { ...text, name: 'x\n' },
    { ...text, font: 'url(evil)' },
    { ...text, color: 'red' },
    { ...text, kind: 'image' },
    { ...text, admin: true },
    { ...text, strokes: [] },
    { ...drawing, strokes: [] },
    {
      ...drawing,
      strokes: [
        {
          width: 4,
          points: [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
          ],
        },
      ],
    },
    {
      ...drawing,
      strokes: [
        {
          width: 13,
          points: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      ],
    },
    { ...drawing, strokes: [{ width: 4, points: [{ x: 0, y: 0 }] }] },
    {
      ...drawing,
      strokes: Array.from({ length: 9 }, () => ({
        width: 4,
        points: Array.from({ length: 256 }, () => ({ x: 0, y: 0 })),
      })),
    },
  ])('rejects invalid payload %#', async (payload) => {
    const { app, repo } = await setup();
    const res = await app.inject({
      method: 'POST',
      url: '/api/signatures',
      payload,
    });
    expect(res.statusCode).toBe(400);
    expect(repo.create).not.toHaveBeenCalled();
  });
  it('rejects malformed JSON, raw uploads and oversized content', async () => {
    const { app } = await setup();
    for (const [payload, contentType, expected] of [
      ['{', 'application/json', 400],
      ['raw', 'image/png', 415],
      ['raw', 'text/plain', 415],
      ['x'.repeat(65537), 'application/json', 413],
    ] as const) {
      const res = await app.inject({
        method: 'POST',
        url: '/api/signatures',
        headers: { 'content-type': contentType },
        payload,
      });
      expect(res.statusCode).toBe(expected);
      expect(res.json().error.code).toBeTruthy();
    }
  });
  it('rate limits publish before another DB call and ignores spoofed forwarded IP', async () => {
    const { app, repo } = await setup();
    for (let i = 0; i < 5; i++)
      expect(
        (
          await app.inject({
            method: 'POST',
            url: '/api/signatures',
            payload: text,
          })
        ).statusCode,
      ).toBe(201);
    const res = await app.inject({
      method: 'POST',
      url: '/api/signatures',
      payload: text,
      headers: { 'x-forwarded-for': '10.0.0.2' },
    });
    expect(res.statusCode).toBe(429);
    expect(res.json().error.code).toBe('RATE_LIMITED');
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
    expect(repo.create).toHaveBeenCalledTimes(5);
  });
  it('protects moderation, handles missing records and removes with valid secret', async () => {
    const { app, repo } = await setup();
    for (const authorization of ['', 'Bearer wrong']) {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/admin/signatures/1',
        headers: { authorization },
      });
      expect(res.statusCode).toBe(401);
    }
    expect(repo.remove).not.toHaveBeenCalled();
    expect(
      (
        await app.inject({
          method: 'DELETE',
          url: '/api/admin/signatures/1',
          headers: { authorization: `Bearer ${secret}` },
        })
      ).statusCode,
    ).toBe(204);
    vi.mocked(repo.remove).mockResolvedValue(false);
    expect(
      (
        await app.inject({
          method: 'DELETE',
          url: '/api/admin/signatures/2',
          headers: { authorization: `Bearer ${secret}` },
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          method: 'DELETE',
          url: '/api/admin/signatures/0',
          headers: { authorization: `Bearer ${secret}` },
        })
      ).statusCode,
    ).toBe(400);
  });
  it('returns generic DB failures and never reports publish success', async () => {
    const { app, repo } = await setup();
    vi.mocked(repo.create).mockRejectedValue(new Error('DB password secret'));
    const res = await app.inject({
      method: 'POST',
      url: '/api/signatures',
      payload: text,
    });
    expect(res.statusCode).toBe(503);
    expect(res.body).not.toContain('password');
    expect(res.json().error.code).toBe('SERVICE_UNAVAILABLE');
    expect((await app.inject('/api/unknown')).json().error.code).toBe(
      'NOT_FOUND',
    );
  });
  it('rejects weak admin secrets and foreign database names', () => {
    expect(() => requireAdminSecret('short')).toThrow();
    expect(() =>
      databaseOptions({ DB_NAME: 'bora', DB_USER: 'x', DB_PASSWORD: 'x' }),
    ).toThrow();
  });
});

it.each([
  ['GET', '/api/signatures', 60],
  ['DELETE', '/api/admin/signatures/1', 10],
] as const)('enforces %s rate limit', async (method, url, max) => {
  const { app } = await setup();
  for (let i = 0; i < max; i++) {
    const res = await app.inject({ method, url });
    expect(res.statusCode).not.toBe(429);
  }
  const res = await app.inject({ method, url });
  expect(res.statusCode).toBe(429);
  expect(res.json().error.code).toBe('RATE_LIMITED');
});
