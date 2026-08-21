import type { Resolver, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import { createPersonFormSchema, updatePersonFormSchema } from "@features/people/schemas/person-form.schema";
import type { PersonActionState } from "@features/people/types/person-action-state.types";
import type { PersonFormFieldName } from "@features/people/types/person-form-field-name.types";
import type { PersonFormInput } from "@features/people/types/person-form-input.types";
import type { Person } from "@features/people/types/person.types";

export const EMPTY_FORM_VALUES: PersonFormInput = {
  firstName: "",
  lastName: "",
  documentNumber: "",
  email: "",
  phoneNumber: "",
  birthDate: "",
  password: "",
  confirmPassword: "",
};

export function getPersonFormResolver(isEdit: boolean): Resolver<PersonFormInput> {
  const schema = isEdit ? updatePersonFormSchema : createPersonFormSchema;

  return zodResolver(schema) as unknown as Resolver<PersonFormInput>;
}

export function getDefaultValues(person: Person | undefined): PersonFormInput {
  if (!person) return { ...EMPTY_FORM_VALUES };

  return {
    firstName: person.firstName,
    lastName: person.lastName,
    documentNumber: person.documentNumber,
    email: person.email ?? "",
    phoneNumber: person.phoneNumber ?? "",
    birthDate: person.birthDate ?? "",
    password: "",
    confirmPassword: "",
  };
}

export function getFormData(values: PersonFormInput, isEdit: boolean, canEdit: boolean, roleIds?: readonly string[]): FormData {
  const formData = new FormData();

  if (!isEdit || canEdit) {
    const keys: Array<keyof PersonFormInput> = isEdit
      ? ["firstName", "lastName", "email", "phoneNumber", "password", "confirmPassword"]
      : ["firstName", "lastName", "documentNumber", "email", "phoneNumber", "birthDate", "password", "confirmPassword"];

    for (const key of keys) {
      formData.append(key, values[key]);
    }
  }

  if (isEdit && roleIds) {
    formData.append("roleIds", JSON.stringify(roleIds));
  }

  return formData;
}

export function setActionFieldErrors(result: PersonActionState, setError: UseFormSetError<PersonFormInput>): boolean {
  if (!result.fieldErrors) return false;

  let hasFieldErrors = false;

  for (const [field, message] of Object.entries(result.fieldErrors)) {
    if (message) {
      setError(field as PersonFormFieldName, { message });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}

export function getErrorTitle(isEdit: boolean): string {
  return isEdit ? PEOPLE_ERROR_MESSAGES.UPDATE_TITLE : PEOPLE_ERROR_MESSAGES.CREATE_TITLE;
}

export function getSubmitLabel({ isEdit, isPending, canEdit = true }: { isEdit: boolean; isPending: boolean; canEdit?: boolean }): string {
  if (isPending) return "Guardando...";
  if (isEdit) return canEdit ? "Guardar cambios" : "Guardar roles";

  return "Crear usuario";
}
