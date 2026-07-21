import type { BackendError } from "@features/platform-auth/types/backend-error.types";
import type { PlatformLoginResult } from "@features/platform-auth/types/platform-login-result.types";

export type LoginPlatformAccountOutput =
  | { success: true; data: PlatformLoginResult }
  | { success: false; error: BackendError };
