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
  response: Response,
  fields: readonly TField[],
  fallbackMessage: string,
): Promise<FieldActionState<TField>> {
  try {
    const error = (await response.json()) as BackendError;

    return {
      error: error.message || fallbackMessage,
      fieldErrors: pickFieldErrors(error.fieldErrors, fields),
    };
  } catch {
    return {
      error: fallbackMessage,
    };
  }
}
