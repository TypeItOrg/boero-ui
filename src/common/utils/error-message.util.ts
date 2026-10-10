export function getErrorMessage(error: unknown, fallback: string): string;
export function getErrorMessage(error: unknown): string | undefined;

export function getErrorMessage(error: unknown, fallback?: string): string | undefined {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
