"use client";

import { startTransition, useActionState, useMemo, useState, type ChangeEvent, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { FORM_MODE } from "@common/types/form-mode.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { createInstitutionAction } from "@features/institutions/actions/create-institution.action";
import { updateInstitutionAction } from "@features/institutions/actions/update-institution.action";
import {
  InstitutionContactFields,
  InstitutionGeneralFields,
  InstitutionLocationFields,
  InstitutionStatusField,
} from "@features/institutions/components/institution-form-fields";
import { InstitutionFormFooter } from "@features/institutions/components/institution-form-footer";
import { InstitutionLogoField } from "@features/institutions/components/institution-logo-field";
import { InstitutionPublicAccessField } from "@features/institutions/components/institution-public-access-field";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { INSTITUTION_LOGO_INTENT } from "@features/institutions/constants/institution-logo.constants";
import { institutionFormSchema, type InstitutionFormInput, type InstitutionFormValues } from "@features/institutions/schemas/institution-form.schema";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import { type InstitutionFormProps } from "@features/institutions/types/institution-form-props.types";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";
import { createInstitutionFormData } from "@features/institutions/utils/institution-form-data.util";
import { getDefaultValues, getInitialLocation, setActionFieldErrors } from "@features/institutions/utils/institution-form.util";
import { appendInstitutionLogoChange } from "@features/institutions/utils/institution-logo-form.util";
import { createInstitutionSlug } from "@features/institutions/utils/institution-slug.util";

const INSTITUTIONS_PATH = "/admin/institutions";

export function InstitutionForm({ mode, institution, returnTo, baseDomain = "" }: InstitutionFormProps): ReactElement {
  const router = useRouter();

  const isEdit = mode === FORM_MODE.EDIT;

  const defaultDestination = isEdit ? `${INSTITUTIONS_PATH}/${institution.id}` : INSTITUTIONS_PATH;

  const destination = getSafeReturnTo(returnTo, defaultDestination);

  const [logoChange, setLogoChange] = useState<InstitutionLogoChange>({
    intent: INSTITUTION_LOGO_INTENT.KEEP,
  });

  const [publicSubdomain, setPublicSubdomain] = useState(institution?.publicSubdomain ?? "");

  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const [active, setActive] = useState(() => institution?.active ?? true);

  const initialLocation = useMemo(() => getInitialLocation(institution), [institution]);

  const defaultValues = useMemo(() => getDefaultValues(institution), [institution]);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<InstitutionFormInput, unknown, InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues,
  });

  const nameField = register("name");

  const slugField = register("slug");

  const [state, formAction, isPending] = useActionState<InstitutionActionState, FormData>(async (_previous, formData) => {
    const request = isEdit ? updateInstitutionAction(institution.id, formData) : createInstitutionAction(formData);

    const result = await safelyRunAction(
      request,
      isEdit ? INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION : INSTITUTION_ERROR_MESSAGES.CREATE_INSTITUTION,
    );

    setActionFieldErrors(result, setError);

    if (result.logoError) {
      setError("root.logo", { type: "server", message: result.logoError });
    }

    if (result.publicSubdomainError) {
      setError("root.publicSubdomain", { type: "server", message: result.publicSubdomainError });
    }

    if (result.success) {
      router.push(destination);
    }

    return result;
  }, {});

  function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    nameField.onChange(event);

    if (!isSlugTouched) {
      setValue("slug", createInstitutionSlug(event.target.value), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>): void {
    setIsSlugTouched(true);
    slugField.onChange(event);
  }

  function onSubmit(values: InstitutionFormValues): void {
    if (errors.root?.logo?.type === "client") {
      return;
    }

    clearErrors();

    const formData = createInstitutionFormData(values, active);

    if (isEdit) {
      appendInstitutionLogoChange(formData, logoChange);
      formData.set("publicSubdomain", publicSubdomain);
    }

    startTransition(() => {
      formAction(formData);
    });
  }

  function handleCancel(): void {
    router.push(destination);
  }

  const errorAlert = state.error ? (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{isEdit ? INSTITUTION_ERROR_MESSAGES.UPDATE_TITLE : INSTITUTION_ERROR_MESSAGES.CREATE_TITLE}</AlertTitle>
      <AlertDescription>{state.error}</AlertDescription>
    </Alert>
  ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <fieldset disabled={isPending} className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {errorAlert}

        <InstitutionGeneralFields
          defaultValues={defaultValues}
          errors={errors}
          nameField={nameField}
          onNameChange={handleNameChange}
          onSlugChange={handleSlugChange}
          slugField={slugField}
        />

        {isEdit ? (
          <>
            <InstitutionPublicAccessField
              value={publicSubdomain}
              baseDomain={baseDomain}
              error={errors.root?.publicSubdomain?.message}
              onChange={(value) => {
                clearErrors("root.publicSubdomain");
                setPublicSubdomain(value);
              }}
            />
            <InstitutionLogoField
              institutionId={institution.id}
              institutionName={institution.name}
              logoUrl={institution.logoUrl}
              value={logoChange}
              disabled={isPending}
              error={errors.root?.logo?.message}
              onChange={(change) => {
                clearErrors("root.logo");
                setLogoChange(change);
              }}
              onError={(message) => setError("root.logo", { type: "client", message })}
            />
          </>
        ) : null}

        <InstitutionLocationFields
          control={control}
          defaultValues={defaultValues}
          errors={errors}
          initialLocation={initialLocation}
          register={register}
        />

        <InstitutionContactFields defaultValues={defaultValues} errors={errors} register={register} />

        <InstitutionStatusField active={active} onActiveChange={setActive} />
      </fieldset>

      <InstitutionFormFooter handleCancel={handleCancel} isPending={isPending} errors={errors} isEdit={isEdit} />
    </form>
  );
}
