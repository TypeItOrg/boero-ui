import type { BackendError } from "./backend-error.types";
import type { PlatformLoginResult } from "./platform-login-result.types";

export type LoginPlatformAccountOutput =
  | { success: true; data: PlatformLoginResult }
  | { success: false; error: BackendError };
