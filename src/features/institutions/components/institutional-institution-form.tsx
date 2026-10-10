"use client";

import { startTransition, useActionState, useMemo, useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { PhoneInput } from "@common/components/ui/restricted-input";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { updateInstitutionalInstitutionAction } from "@features/institutions/actions/update-institutional-institution.action";
import { FormCard } from "@features/institutions/components/institution-form-card";
import { InstitutionLogoField } from "@features/institutions/components/institution-logo-field";
import { InstitutionalInstitutionLocationFields } from "@features/institutions/components/institutional-institution-location-fields";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { INSTITUTION_LOGO_INTENT } from "@features/institutions/constants/institution-logo.constants";
import {
  institutionalInstitutionFormSchema,
  type InstitutionalInstitutionFormInput,
  type InstitutionalInstitutionFormValues,
} from "@features/institutions/schemas/institutional-institution-form.schema";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";
import type { Institution } from "@features/institutions/types/institution.types";
import { createInstitutionFormData } from "@features/institutions/utils/institution-form-data.util";
import { appendInstitutionLogoChange } from "@features/institutions/utils/institution-logo-form.util";
import { applyServerErrors, getDefaultValues, getInitialLocation } from "@features/institutions/utils/institutional-institution-form.util";

type InstitutionalInstitutionFormProps = {
  institution: Institution;
  returnTo?: string;
};

export function InstitutionalInstitutionForm({ institution, returnTo = "/institution" }: InstitutionalInstitutionFormProps): ReactElement {
  const router = useRouter();

  const destination = getSafeReturnTo(returnTo, "/institution");

  const [logoChange, setLogoChange] = useState<InstitutionLogoChange>({
    intent: INSTITUTION_LOGO_INTENT.KEEP,
  });

  const initialLocation = useMemo(() => getInitialLocation(institution), [institution]);

  const defaultValues = useMemo(() => getDefaultValues(institution), [institution]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<InstitutionalInstitutionFormInput, unknown, InstitutionalInstitutionFormValues>({
    resolver: zodResolver(institutionalInstitutionFormSchema),
    defaultValues,
  });

  const [state, formAction, isPending] = useActionState<InstitutionActionState, FormData>(async (_previous, formData) => {
    const result = await safelyRunAction(
      updateInstitutionalInstitutionAction(institution.id, formData),
      INSTITUTION_ERROR_MESSAGES.UPDATE_INSTITUTION,
    );

    applyServerErrors(result, setError);

    if (result.logoError) {
      setError("root.logo", { type: "server", message: result.logoError });
    }

    if (result.success) {
      router.push(destination);
    }

    return result;
  }, {});

  function onSubmit(values: InstitutionalInstitutionFormValues): void {
    if (errors.root?.logo?.type === "client") {
      return;
    }

    clearErrors();

    const formData = createInstitutionFormData(values);

    appendInstitutionLogoChange(formData, logoChange);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {state.error && logoChange.intent !== INSTITUTION_LOGO_INTENT.KEEP && (
        <Alert variant="destructive">
          <CircleAlertIcon className="size-4" />
          <AlertTitle>Error al guardar</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <fieldset disabled={isPending} className="bg-background flex min-w-0 flex-col gap-6 rounded-xl shadow-xs">
        <FormCard title="Información general">
          <Field data-invalid={!!errors.name}>
            <FieldContent>
              <FieldLabel htmlFor="institution-name">Nombre de la institución</FieldLabel>
            </FieldContent>
            <Input
              id="institution-name"
              defaultValue={defaultValues.name}
              placeholder="Conservatorio Superior de Música"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>
        </FormCard>

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
          onError={(message) => (message ? setError("root.logo", { type: "client", message }) : clearErrors("root.logo"))}
        />

        <InstitutionalInstitutionLocationFields
          control={control}
          initialLocation={initialLocation}
          errors={errors}
          defaultValues={defaultValues}
          register={register}
        />

        <FormCard title="Contacto">
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!errors.phoneNumber} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="institution-phone">Teléfono</FieldLabel>
              </FieldContent>
              <PhoneInput
                id="institution-phone"
                defaultValue={defaultValues.phoneNumber}
                maxLength={30}
                placeholder="0353-4619146"
                aria-invalid={!!errors.phoneNumber}
                {...register("phoneNumber")}
              />
              <FieldError errors={[errors.phoneNumber]} />
            </Field>

            <Field data-invalid={!!errors.email} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="institution-email">Email</FieldLabel>
              </FieldContent>
              <Input
                id="institution-email"
                defaultValue={defaultValues.email}
                type="email"
                maxLength={150}
                placeholder="info@conservatorio.edu.ar"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>
          </FieldGroup>
        </FormCard>
      </fieldset>

      <div className="border-border/40 flex flex-row flex-wrap items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={isPending}
          onClick={() => router.push(destination)}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={isPending || errors.root?.logo?.type === "client"}
          aria-busy={isPending}
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
