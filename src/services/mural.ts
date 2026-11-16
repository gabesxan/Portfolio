import { apiRequest } from './api';
import type { SignatureInput, SignaturePage, Signature } from './types';
export * from './types';
export function listSignatures(
  options: { limit?: number; cursor?: string } = {},
  signal?: AbortSignal,
) {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.cursor) params.set('cursor', options.cursor);
  return apiRequest<SignaturePage>(`/signatures?${params}`, { signal });
}
export function publishSignature(input: SignatureInput, signal?: AbortSignal) {
  return apiRequest<{ data: Signature }>('/signatures', {
    method: 'POST',
    body: JSON.stringify(input),
    signal,
  });
}
