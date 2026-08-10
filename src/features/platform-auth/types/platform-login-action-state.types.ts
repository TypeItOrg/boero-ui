import type { PlatformLoginFieldName } from "@features/platform-auth/types/platform-login-field-name.types";

export type PlatformLoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<PlatformLoginFieldName, string>>;
};
