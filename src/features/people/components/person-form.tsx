"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { createInstitutionalPersonAction, createPlatformPersonAction } from "@features/people/actions/create-person.action";
import { updateInstitutionalPersonAction, updatePlatformPersonAction } from "@features/people/actions/update-person.action";
import { PersonCreateFields, PersonDetailsFields, PersonPasswordFields } from "@features/people/components/person-form-fields";
import type { Person } from "@features/people/types/person.types";
import type { PersonActionState } from "@features/people/types/person-action-state.types";
import type { PersonFormInput } from "@features/people/types/person-form-input.types";
import { FORM_MODE } from "@common/types/form-mode.types";
import {
  getDefaultValues,
  getErrorTitle,
  getFormData,
  getPersonFormResolver,
  getSubmitLabel,
  setActionFieldErrors,
} from "@features/people/utils/person-form.util";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PersonFormCommonProps = {
  institutionId: string;
  formId?: string;
  hideActions?: boolean;
  scope?: PeopleScopeType;
  returnTo?: string;
};

type CreateMode = PersonFormCommonProps & {
  mode: typeof FORM_MODE.CREATE;
  person?: never;
  roleIds?: never;
  canEdit?: never;
};

type EditMode = PersonFormCommonProps & {
  mode: typeof FORM_MODE.EDIT;
  person: Person;
  roleIds?: readonly string[];
  canEdit?: boolean;
};

type PersonFormProps = CreateMode | EditMode;

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
  const isEdit = mode === FORM_MODE.EDIT;
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
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col gap-4">
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

      {!hideActions && (
        <div className="flex flex-row flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={handleCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
            {getSubmitLabel({ isEdit, isPending, canEdit })}
          </Button>
        </div>
      )}
    </form>
  );
}
