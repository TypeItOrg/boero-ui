import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";

export function getApiUrlOrThrow(): string {
  const BOERO_API_URL = process.env.BOERO_API_URL;

  if (!BOERO_API_URL) {
    throw new Error(COMMON_ERROR_MESSAGES.MISSING_API_URL);
  }

  return BOERO_API_URL;
}
