import type { BackendError } from "@common/types/backend-error.types";
import { getFieldErrors, pickFieldErrors } from "@common/utils/form-field-errors.util";

export type FieldActionState<TField extends string> = {
  success?: boolean;
  error?: string;
  fieldErrors?: Partial<Record<TField, string>>;
};

export function getValidationActionState<TField extends string>(
  issues: Array<{ path: PropertyKey[]; message: string }>,
  fields: readonly TField[],
): FieldActionState<TField> {
  return {
    fieldErrors: getFieldErrors(issues, fields),
  };
}

export async function getResponseErrorActionState<TField extends string>(
  response: Response | Promise<Response>,
  fields: readonly TField[],
  fallbackMessage: string,
): Promise<FieldActionState<TField> | undefined> {
  let resolvedResponse: Response;

  try {
    resolvedResponse = await response;
  } catch {
    return { error: fallbackMessage };
  }

  if (resolvedResponse.ok) return undefined;

  try {
    const error = (await resolvedResponse.json()) as BackendError;
    const fieldErrors = pickFieldErrors(error.fieldErrors, fields);
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    return {
      error: error.message || fallbackMessage,
      ...(hasFieldErrors ? { fieldErrors } : {}),
    };
  } catch {
    return {
      error: fallbackMessage,
    };
  }
}
