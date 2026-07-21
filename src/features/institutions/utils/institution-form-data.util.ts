export function createInstitutionFormData(values: Record<string, unknown>, active?: boolean): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.append(key, (value ?? "") as string);
  }

  if (active !== undefined) {
    formData.append("active", String(active));
  }

  return formData;
}
