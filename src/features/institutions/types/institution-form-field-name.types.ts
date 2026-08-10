export const INSTITUTION_FORM_FIELD_NAMES = [
  "name",
  "slug",
  "cityId",
  "street",
  "number",
  "neighborhood",
  "additionalInfo",
  "phoneNumber",
  "email",
] as const;

export type InstitutionFormFieldName = (typeof INSTITUTION_FORM_FIELD_NAMES)[number];
