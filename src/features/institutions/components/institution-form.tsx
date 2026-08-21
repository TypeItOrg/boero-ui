"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import {
  InstitutionContactFields,
  InstitutionGeneralFields,
  InstitutionLocationFields,
  InstitutionStatusField,
} from "@features/institutions/components/institution-form-fields";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { institutionFormSchema, type InstitutionFormInput, type InstitutionFormValues } from "@features/institutions/schemas/institution-form.schema";
import { createInstitutionAction } from "@features/institutions/actions/create-institution.action";
import { updateInstitutionAction } from "@features/institutions/actions/update-institution.action";
import type { Institution } from "@features/institutions/types/institution.types";
import { createInstitutionFormData } from "@features/institutions/utils/institution-form-data.util";
import { createInstitutionSlug } from "@features/institutions/utils/institution-slug.util";
import { FORM_MODE } from "@common/types/form-mode.types";
import { getDefaultValues, getInitialLocation, getSubmitLabel, setActionFieldErrors } from "@features/institutions/utils/institution-form.util";

const INSTITUTIONS_PATH = "/admin/institutions";

type CreateMode = {
  mode: typeof FORM_MODE.CREATE;
  institution?: never;
};

type EditMode = {
  mode: typeof FORM_MODE.EDIT;
  institution: Institution;
};

type InstitutionFormProps = (CreateMode | EditMode) & {
  returnTo?: string;
};

export function InstitutionForm({ mode, institution, returnTo }: InstitutionFormProps): React.ReactElement {
  const router = useRouter();
  const isEdit = mode === FORM_MODE.EDIT;
  const defaultDestination = isEdit ? `${INSTITUTIONS_PATH}/${institution.id}` : INSTITUTIONS_PATH;
  const destination = returnTo ?? defaultDestination;
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const [isSlugTouched, setIsSlugTouched] = React.useState(false);
  const [active, setActive] = React.useState(() => institution?.active ?? true);

  const initialLocation = React.useMemo(() => getInitialLocation(institution), [institution]);
  const defaultValues = React.useMemo(() => getDefaultValues(institution), [institution]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<InstitutionFormInput, unknown, InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues,
  });

  const nameField = register("name");
  const slugField = register("slug");

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    nameField.onChange(event);
    if (!isSlugTouched) {
      setValue("slug", createInstitutionSlug(event.target.value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setIsSlugTouched(true);
    slugField.onChange(event);
  }

  function onSubmit(values: InstitutionFormValues): void {
    setFormError(undefined);
    const formData = createInstitutionFormData(values, active);

    startTransition(async () => {
      const result = isEdit ? await updateInstitutionAction(institution.id, formData) : await createInstitutionAction(formData);
      const hasFieldErrors = setActionFieldErrors(result, setError);
      setFormError(hasFieldErrors ? undefined : result.error);

      if (result.success) {
        router.push(destination);
      }
    });
  }

  function handleCancel(): void {
    router.push(destination);
  }

  const errorAlert = formError ? (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{isEdit ? INSTITUTION_ERROR_MESSAGES.UPDATE_TITLE : INSTITUTION_ERROR_MESSAGES.CREATE_TITLE}</AlertTitle>
      <AlertDescription>{formError}</AlertDescription>
    </Alert>
  ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {errorAlert}

        <InstitutionGeneralFields
          defaultValues={defaultValues}
          errors={errors}
          nameField={nameField}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          slugField={slugField}
        />

        <InstitutionLocationFields
          control={control}
          defaultValues={defaultValues}
          errors={errors}
          initialLocation={initialLocation}
          register={register}
        />

        <InstitutionContactFields defaultValues={defaultValues} errors={errors} register={register} />

        <InstitutionStatusField active={active} onActiveChange={setActive} />
      </div>

      <div className="border-border/40 flex flex-row flex-wrap items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={handleCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {getSubmitLabel({ isEdit, isPending })}
        </Button>
      </div>
    </form>
  );
}
