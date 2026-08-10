export const PERSON_FORM_FIELD_NAMES = [
  "firstName",
  "lastName",
  "documentNumber",
  "email",
  "phoneNumber",
  "birthDate",
  "password",
  "confirmPassword",
] as const;

export type PersonFormFieldName = (typeof PERSON_FORM_FIELD_NAMES)[number];
