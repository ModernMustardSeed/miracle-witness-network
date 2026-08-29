import { request as httpsRequest } from 'node:https';
import { gunzipSync } from 'node:zlib';

/**
 * A second way to make an HTTPS request.
 *
 * GDELT is slow and intermittent: measured from one machine it answered three
 * requests in five, taking 22 to 39 seconds each, and the global `fetch`
 * (undici) took a connection reset at six seconds on calls where curl went on
 * to succeed. Two transports that fail differently beat one that fails often,
 * so the GDELT lane alternates between them across its retries.
 *
 * Only GDELT needs this. Every RSS feed answers `fetch` in under two seconds.
 */

export interface TextResponse {
  status: number;
  body: string;
}

export async function getTextViaFetch(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<TextResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers, signal: controller.signal, cache: 'no-store' });
    return { status: response.status, body: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

export function getTextViaNode(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<TextResponse> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      url,
      { method: 'GET', headers: { ...headers, 'accept-encoding': 'gzip' } },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const raw = Buffer.concat(chunks);
          const gzipped = response.headers['content-encoding'] === 'gzip';
          try {
            resolve({
              status: response.statusCode ?? 0,
              body: (gzipped ? gunzipSync(raw) : raw).toString('utf8'),
            });
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
        response.on('error', reject);
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Timed out after ${timeoutMs}ms`));
    });
    request.on('error', reject);
    request.end();
  });
}
