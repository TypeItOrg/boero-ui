import type { InstitutionalRegisterFieldName } from "@features/institutional-auth/types/institutional-register-field-name.types";

export type InstitutionalRegisterActionState = {
  error?: string;
  fieldErrors?: Partial<Record<InstitutionalRegisterFieldName, string>>;
};
