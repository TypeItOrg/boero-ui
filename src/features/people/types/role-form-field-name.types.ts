export const ROLE_FORM_FIELD_NAMES = ["role"] as const;

export type RoleFormFieldName = (typeof ROLE_FORM_FIELD_NAMES)[number];
