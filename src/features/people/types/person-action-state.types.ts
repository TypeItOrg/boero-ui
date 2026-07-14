import type { FieldActionState } from "@common/utils/action-state.util";

export const PERSON_FORM_FIELD_NAMES = [
  "firstName",
  "lastName",
  "documentNumber",
  "email",
  "phoneNumber",
  "birthDate",
  "password",
] as const;

export type PersonFormFieldName = (typeof PERSON_FORM_FIELD_NAMES)[number];

export type PersonActionState = FieldActionState<PersonFormFieldName>;
