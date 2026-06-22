export const PLATFORM_LOGIN_FIELD_NAMES = ["email", "password"] as const;

export type PlatformLoginFieldName = (typeof PLATFORM_LOGIN_FIELD_NAMES)[number];

export type PlatformLoginActionState = {
  error?: string;
  fieldErrors?: Partial<Record<PlatformLoginFieldName, string>>;
};
