import type { UseFormSetError } from "react-hook-form";

import type { PlatformAccountFormInput, PlatformAccountFormValues } from "@features/platform-accounts/schemas/platform-account-form.schema";
import type { PlatformAccountActionState } from "@features/platform-accounts/types/platform-account-action-state.types";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import type { PlatformAccountFormFieldName } from "@features/platform-accounts/types/platform-account-form-field-name.types";

export const EMPTY_FORM_VALUES: PlatformAccountFormInput = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function getSectionDescription(isEdit: boolean): string {
  return isEdit
    ? "Actualizá la identidad del administrador o definí una nueva contraseña."
    : "El administrador quedará habilitado desde el momento de su creación.";
}

export function getDefaultValues(account: PlatformAccountAdmin | undefined): PlatformAccountFormInput {
  if (!account) return EMPTY_FORM_VALUES;

  return {
    name: account.name,
    lastName: account.lastName,
    email: account.email,
    password: "",
    confirmPassword: "",
  };
}

export function hasSensitiveChanges(values: PlatformAccountFormValues, account: PlatformAccountAdmin): boolean {
  const emailChanged = values.email.toLowerCase() !== account.email.toLowerCase();
  return emailChanged || values.password !== "";
}

export function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return isEdit ? "Guardando..." : "Creando...";
  return isEdit ? "Guardar cambios" : "Crear administrador";
}

export function createFormData(values: PlatformAccountFormValues): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}

export function setActionFieldErrors(result: PlatformAccountActionState, setError: UseFormSetError<PlatformAccountFormInput>): boolean {
  if (!result.fieldErrors) return false;

  let hasFieldErrors = false;
  for (const [field, message] of Object.entries(result.fieldErrors)) {
    if (message) {
      setError(field as PlatformAccountFormFieldName, { message });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}
