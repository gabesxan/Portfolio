import { it, expect, vi, afterEach } from 'vitest';
import { listSignatures, publishSignature } from '../src/services/mural';
import { ApiError } from '../src/services/api';
afterEach(() => vi.unstubAllGlobals());
it('serializes pagination and posts exact payload without any automatic retry', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [],
          pagination: { limit: 12, nextCursor: null, hasMore: false },
        }),
        { status: 200 },
      ),
    )
    .mockRejectedValueOnce(new TypeError('Network failure'));
  vi.stubGlobal('fetch', fetch);
  await listSignatures({ limit: 12, cursor: '123' });
  expect(fetch.mock.calls[0][0]).toBe('/api/signatures?limit=12&cursor=123');
  await expect(
    publishSignature({
      name: 'Visitor',
      kind: 'text',
      color: '#153ed5',
      font: 'marker',
    }),
  ).rejects.toThrow('Network failure');
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('preserves structured API errors for UI feedback', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'RATE_LIMITED', message: 'Wait.' } }),
          { status: 429 },
        ),
      ),
  );
  await expect(listSignatures()).rejects.toEqual(
    new ApiError(429, 'RATE_LIMITED', 'Wait.'),
  );
});
