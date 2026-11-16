import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { SignatureInput } from '../src/services/types.js';
import type { SignatureRepository } from './repository.js';
import { idSchema, signatureSchema } from './schema.js';
import { requireAdminSecret } from './config.js';
export async function buildApp(
  repository: SignatureRepository,
  secret: string,
) {
  requireAdminSecret(secret);
  const app = Fastify({
    logger: false,
    bodyLimit: 65536,
    requestTimeout: 10000,
    trustProxy: false,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 60,
    timeWindow: 60000,
    cache: 5000,
    hook: 'onRequest',
  });
  const errorBody = (code: string, message: string) => ({
    error: { code, message },
  });
  app.setErrorHandler((error, _request, reply) => {
    const status = (error as { statusCode?: number }).statusCode ?? 500;
    const errors: Record<number, [string, string]> = {
      400: ['VALIDATION_ERROR', 'Invalid request.'],
      401: ['UNAUTHORIZED', 'Admin authentication required.'],
      404: ['NOT_FOUND', 'Not found.'],
      413: ['PAYLOAD_TOO_LARGE', 'Request exceeds 65536 bytes.'],
      415: ['UNSUPPORTED_MEDIA_TYPE', 'Use application/json.'],
      429: ['RATE_LIMITED', 'Too many requests.'],
      503: ['SERVICE_UNAVAILABLE', 'Mural temporarily unavailable.'],
    };
    const safeStatus = errors[status] ? status : 500;
    const [code, message] = errors[safeStatus] ?? [
      'INTERNAL_ERROR',
      'Unable to complete request.',
    ];
    reply.code(safeStatus).send(errorBody(code, message));
  });
  app.setNotFoundHandler((_request, reply) =>
    reply.code(404).send(errorBody('NOT_FOUND', 'Not found.')),
  );
  app.addHook('onSend', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store');
  });
  const dbCall = async <T>(action: () => Promise<T>): Promise<T> => {
    try {
      return await action();
    } catch {
      throw Object.assign(new Error('Database unavailable'), {
        statusCode: 503,
      });
    }
  };
  app.get<{ Querystring: { limit?: string; cursor?: string } }>(
    '/api/signatures',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            limit: { type: 'string', pattern: '^(?:[1-9]|1[0-9]|2[0-4])$' },
            cursor: idSchema,
          },
        },
      },
    },
    async (request) =>
      dbCall(() =>
        repository.list(
          Number(request.query.limit ?? 12),
          request.query.cursor,
        ),
      ),
  );
  app.post<{ Body: SignatureInput }>(
    '/api/signatures',
    {
      schema: { body: signatureSchema },
      config: { rateLimit: { max: 5, timeWindow: 60000 } },
      preParsing: async (request, _reply, payload) => {
        if (
          request.headers['content-type']
            ?.split(';')[0]
            .trim()
            .toLowerCase() !== 'application/json'
        )
          throw Object.assign(new Error(), { statusCode: 415 });
        return payload;
      },
    },
    async (request, reply) => {
      const input = { ...request.body, name: request.body.name.trim() };
      if (
        !input.name ||
        /\p{Cc}/u.test(request.body.name) ||
        (input.kind === 'drawing' &&
          input.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0) >
            2048)
      )
        throw Object.assign(new Error(), { statusCode: 400 });
      return reply
        .code(201)
        .send({ data: await dbCall(() => repository.create(input)) });
    },
  );
  const hash = (value: string) => createHash('sha256').update(value).digest();
  app.delete<{ Params: { id: string } }>(
    '/api/admin/signatures/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: { id: idSchema },
          additionalProperties: false,
        },
      },
      config: { rateLimit: { max: 10, timeWindow: 60000 } },
      preParsing: async (request, reply, payload) => {
        if (
          !timingSafeEqual(
            hash(request.headers.authorization ?? ''),
            hash(`Bearer ${secret}`),
          )
        )
          return reply
            .code(401)
            .send(errorBody('UNAUTHORIZED', 'Admin authentication required.'));
        return payload;
      },
    },
    async (request, reply) => {
      const removed = await dbCall(() => repository.remove(request.params.id));
      return removed
        ? reply.code(204).send()
        : reply.code(404).send(errorBody('NOT_FOUND', 'Not found.'));
    },
  );
  return app;
}
