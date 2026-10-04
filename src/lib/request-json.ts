/** Bound bytes before parsing rather than trusting client Content-Length. */
export class RequestInputError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function readRequestObject(request: Request, maxBytes = 32_768): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get('content-length'));
  if (declared > maxBytes) throw new RequestInputError(413, 'The request is too large.');
  if (!request.body) throw new RequestInputError(400, 'Malformed request.');
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new RequestInputError(413, 'The request is too large.');
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }
  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new RequestInputError(400, 'Malformed request.');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new RequestInputError(400, 'Expected a JSON object.');
  }
  return payload as Record<string, unknown>;
}
