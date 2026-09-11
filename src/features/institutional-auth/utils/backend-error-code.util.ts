import type { BackendError } from "@common/types/backend-error.types";

export async function readBackendErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as Partial<BackendError> | null;
    return typeof body?.code === "string" ? body.code : undefined;
  } catch {
    return undefined;
  }
}
