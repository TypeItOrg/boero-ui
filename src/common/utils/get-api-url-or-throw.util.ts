export function getApiUrlOrThrow(): string {
  const BOERO_API_URL = process.env.BOERO_API_URL;

  if (!BOERO_API_URL) {
    throw new Error("Missing BOERO_API_URL environment variable.");
  }

  return BOERO_API_URL;
}
