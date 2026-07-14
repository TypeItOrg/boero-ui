export type HttpError = Error & {
  status: number;
  statusCode: number;
};

export function createHttpError(message: string, status: number): HttpError {
  const error = new Error(message) as HttpError;

  error.status = status;
  error.statusCode = status;

  return error;
}

export function createHttpResponseError(response: Response, message?: string): HttpError {
  return createHttpError(message ?? `Request failed with status ${response.status}`, response.status);
}

export function isHttpStatusError(error: unknown, status: number): boolean {
  const httpError = error as Partial<HttpError> & { message?: string };

  return (
    httpError.status === status ||
    httpError.statusCode === status ||
    (httpError.message?.includes(String(status)) ?? false)
  );
}
