export class HttpResponseError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpResponseError";
    this.status = status;
  }
}

export function isHttpResponseError(error: unknown, status?: number): error is HttpResponseError {
  if (!(error instanceof HttpResponseError)) return false;

  return status === undefined || error.status === status;
}

export async function parseHttpResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    throw new HttpResponseError(fallbackMessage, response.status);
  }

  return response.json() as Promise<T>;
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
