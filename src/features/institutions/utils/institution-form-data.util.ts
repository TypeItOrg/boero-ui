import type { InstitutionFormValues } from "@features/institutions/schemas/institution-form.schema";

export function createInstitutionFormData(values: InstitutionFormValues, active?: boolean): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.append(key, value);
  }

  if (active !== undefined) {
    formData.append("active", String(active));
  }

  return formData;
}
