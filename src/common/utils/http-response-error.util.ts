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
