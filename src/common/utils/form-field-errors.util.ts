export function getFieldErrors<T extends string>(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  fields: readonly T[],
): Partial<Record<T, string>> {
  const result = {} as Partial<Record<T, string>>;

  for (const issue of issues) {
    const field = getIssueField(issue.path, fields);
    if (field) result[field] = issue.message;
  }

  return result;
}

function getIssueField<T extends string>(path: PropertyKey[], fields: readonly T[]): T | undefined {
  const nestedField = path.filter((part) => typeof part === "string" || typeof part === "number").join(".");
  if (fields.includes(nestedField as T)) return nestedField as T;

  const rootField = path[0];
  if (typeof rootField === "string" && fields.includes(rootField as T)) return rootField as T;

  return undefined;
}

export function pickFieldErrors<T extends string>(fieldErrors: Record<string, string> | undefined, fields: readonly T[]): Partial<Record<T, string>> {
  const result = {} as Partial<Record<T, string>>;

  for (const field of fields) {
    const message = fieldErrors?.[field];
    if (message) {
      result[field] = message;
    }
  }

  return result;
}
