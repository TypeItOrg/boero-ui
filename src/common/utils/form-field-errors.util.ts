export function getFieldErrors<T extends string>(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  fields: readonly T[],
): Partial<Record<T, string>> {
  const result = {} as Partial<Record<T, string>>;

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field === "string" && fields.includes(field as T)) {
      result[field as T] = issue.message;
    }
  }

  return result;
}

export function pickFieldErrors<T extends string>(
  fieldErrors: Record<string, string> | undefined,
  fields: readonly T[],
): Partial<Record<T, string>> {
  const result = {} as Partial<Record<T, string>>;

  for (const field of fields) {
    result[field] = fieldErrors?.[field];
  }

  return result;
}
