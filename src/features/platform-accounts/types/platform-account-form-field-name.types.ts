export const PLATFORM_ACCOUNT_FORM_FIELD_NAMES = ["name", "lastName", "email", "password", "confirmPassword"] as const;

export type PlatformAccountFormFieldName = (typeof PLATFORM_ACCOUNT_FORM_FIELD_NAMES)[number];
