"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { PEOPLE_ERROR_MESSAGES } from "@features/people/constants/error-messages.constants";
import {
  createInstitutionalPersonAction,
  createPlatformPersonAction,
} from "@features/people/actions/create-person.action";
import {
  updateInstitutionalPersonAction,
  updatePlatformPersonAction,
} from "@features/people/actions/update-person.action";
import {
  PersonCreateFields,
  PersonDetailsFields,
  PersonPasswordFields,
} from "@features/people/components/person-form-fields";
import { createPersonFormSchema, updatePersonFormSchema } from "@features/people/schemas/person-form.schema";
import type { Person } from "@features/people/types/person.types";
import type { PersonActionState } from "@features/people/types/person-action-state.types";
import type { PersonFormFieldName } from "@features/people/types/person-form-field-name.types";
import type { PersonFormInput } from "@features/people/types/person-form-input.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PersonFormCommonProps = {
  institutionId: string;
  formId?: string;
  hideActions?: boolean;
  scope?: PeopleScopeType;
  returnTo?: string;
};

type CreateMode = PersonFormCommonProps & {
  mode: "create";
  person?: never;
  roleIds?: never;
  canEdit?: never;
};

type EditMode = PersonFormCommonProps & {
  mode: "edit";
  person: Person;
  roleIds?: readonly string[];
  canEdit?: boolean;
};

type PersonFormProps = CreateMode | EditMode;

const EMPTY_FORM_VALUES: PersonFormInput = {
  firstName: "",
  lastName: "",
  documentNumber: "",
  email: "",
  phoneNumber: "",
  birthDate: "",
  password: "",
  confirmPassword: "",
};

export function PersonForm({
  mode,
  institutionId,
  person,
  roleIds,
  formId,
  hideActions = false,
  canEdit = true,
  scope = PeopleScope.ADMIN,
  returnTo,
}: PersonFormProps): React.ReactElement {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const listPath = PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`;
  const destination = returnTo ?? listPath;
  const resolver = getPersonFormResolver(isEdit);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<PersonFormInput>({
    resolver,
    defaultValues: getDefaultValues(person),
  });

  function onSubmit(values: PersonFormInput): void {
    setFormError(undefined);

    startTransition(async () => {
      const formData = getFormData(values, isEdit, canEdit, roleIds);
      const result = await submitPerson(formData);

      const hasFieldErrors = setActionFieldErrors(result, setError);
      setFormError(hasFieldErrors ? undefined : result.error);

      if (result.success) {
        router.push(destination);
      }
    });
  }

  async function submitPerson(formData: FormData): Promise<PersonActionState> {
    if (isEdit && person) {
      if (PeopleScope.isInstitutional(scope)) {
        return updateInstitutionalPersonAction(institutionId, person.personId, formData);
      }

      return updatePlatformPersonAction(institutionId, person.personId, formData);
    }

    if (PeopleScope.isInstitutional(scope)) {
      return createInstitutionalPersonAction(institutionId, formData);
    }

    return createPlatformPersonAction(institutionId, formData);
  }

  function handleCancel(): void {
    router.push(destination);
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{getErrorTitle(isEdit)}</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <fieldset disabled={isEdit && !canEdit} className="contents">
          <PersonDetailsFields errors={errors} isEdit={isEdit} person={person} register={register} />
        </fieldset>

        {isEdit ? (
          <fieldset disabled={!canEdit} className="contents">
            <PersonPasswordFields errors={errors} register={register} />
          </fieldset>
        ) : (
          <PersonCreateFields control={control} errors={errors} register={register} />
        )}
      </div>

      {!hideActions && (
        <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-[1_0_min(140px,100%)] sm:flex-none"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="flex-[1_0_min(140px,100%)] sm:flex-none" disabled={isPending}>
            {getSubmitLabel({ isEdit, isPending })}
          </Button>
        </div>
      )}
    </form>
  );
}

function getPersonFormResolver(isEdit: boolean): Resolver<PersonFormInput> {
  const schema = isEdit ? updatePersonFormSchema : createPersonFormSchema;

  return zodResolver(schema) as unknown as Resolver<PersonFormInput>;
}

function getDefaultValues(person: Person | undefined): PersonFormInput {
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

function getFormData(
  values: PersonFormInput,
  isEdit: boolean,
  canEdit: boolean,
  roleIds?: readonly string[],
): FormData {
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

function setActionFieldErrors(result: PersonActionState, setError: UseFormSetError<PersonFormInput>): boolean {
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

function getErrorTitle(isEdit: boolean): string {
  return isEdit ? PEOPLE_ERROR_MESSAGES.UPDATE_TITLE : PEOPLE_ERROR_MESSAGES.CREATE_TITLE;
}

function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return "Guardando...";
  if (isEdit) return "Guardar cambios";

  return "Crear usuario";
}
