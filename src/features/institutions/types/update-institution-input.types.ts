import type { CreateInstitutionInput } from "@features/institutions/types/create-institution-input.types";

export type UpdateInstitutionInput = CreateInstitutionInput & {
  active: boolean;
};
