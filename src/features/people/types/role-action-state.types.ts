import type { FieldActionState } from "@common/utils/action-state.util";

export const ROLE_FORM_FIELD_NAMES = ["role"] as const;

export type RoleFormFieldName = (typeof ROLE_FORM_FIELD_NAMES)[number];

export type RoleActionState = FieldActionState<RoleFormFieldName>;
