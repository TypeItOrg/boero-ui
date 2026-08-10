export class HttpResponseError extends Error {
  readonly status: number;
  readonly requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "HttpResponseError";
    this.status = status;
    this.requestId = requestId;
  }
}

export function isHttpResponseError(error: unknown, status?: number): error is HttpResponseError {
  if (!(error instanceof HttpResponseError)) return false;

  return status === undefined || error.status === status;
}

export async function parseHttpResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await parseJson(response);
  if (!response.ok) {
    const message = getErrorMessage(payload) ?? fallbackMessage;
    throw new HttpResponseError(message, response.status, response.headers.get("x-request-id") ?? undefined);
  }

  return payload as T;
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function getErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || !("message" in payload)) return undefined;
  const message = payload.message;
  if (typeof message !== "string" || message.length === 0) return undefined;
  return message;
}

/**
 * Parses an optional resource without hiding authorization or availability
 * failures. A missing resource is the only unsuccessful response represented
 * as null.
 */
export async function parseNullableHttpResponse<T>(response: Response, fallbackMessage: string): Promise<T | null> {
  if (response.status === 404) return null;

  return parseHttpResponse<T>(response, fallbackMessage);
}
