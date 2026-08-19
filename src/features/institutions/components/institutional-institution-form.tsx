"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { Textarea } from "@common/components/ui/textarea";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { LocationPicker } from "@features/locations/components/location-picker";
import {
  institutionalInstitutionFormSchema,
  type InstitutionalInstitutionFormInput,
  type InstitutionalInstitutionFormValues,
} from "@features/institutions/schemas/institutional-institution-form.schema";
import { updateInstitutionalInstitutionAction } from "@features/institutions/actions/update-institutional-institution.action";
import type { Institution } from "@features/institutions/types/institution.types";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import { createInstitutionFormData } from "@features/institutions/utils/institution-form-data.util";

type InstitutionalInstitutionFormProps = {
  institution: Institution;
  returnTo?: string;
};

type InitialLocation = React.ComponentProps<typeof LocationPicker>["initialLocation"];

export function InstitutionalInstitutionForm({
  institution,
  returnTo = "/institution",
}: InstitutionalInstitutionFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();

  const initialLocation = React.useMemo(() => getInitialLocation(institution), [institution]);
  const defaultValues = React.useMemo(() => getDefaultValues(institution), [institution]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<InstitutionalInstitutionFormInput, unknown, InstitutionalInstitutionFormValues>({
    resolver: zodResolver(institutionalInstitutionFormSchema),
    defaultValues,
  });

  function onSubmit(values: InstitutionalInstitutionFormValues): void {
    setFormError(undefined);
    const formData = createInstitutionFormData(values);

    startTransition(async () => {
      const state = await updateInstitutionalInstitutionAction(institution.id, formData);
      if (!state.success) {
        applyServerErrors(state, setError, setFormError);
        return;
      }
      router.push(returnTo);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {formError && (
        <Alert variant="destructive">
          <CircleAlertIcon className="size-4" />
          <AlertTitle>Error al guardar</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-background flex flex-col gap-6 rounded-xl shadow-xs">
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

        <FormCard title="Ubicación">
          <div className="flex flex-col gap-4">
            <Controller
              control={control}
              name="cityId"
              render={({ field, fieldState }) => (
                <LocationPicker
                  error={fieldState.error?.message}
                  initialLocation={initialLocation}
                  onValueChange={field.onChange}
                />
              )}
            />

            <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
              <Field data-invalid={!!errors.street} className="flex-[1_0_min(250px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="institution-street">Calle</FieldLabel>
                </FieldContent>
                <Input
                  id="institution-street"
                  defaultValue={defaultValues.street}
                  placeholder="Bv. España"
                  aria-invalid={!!errors.street}
                  {...register("street")}
                />
                <FieldError errors={[errors.street]} />
              </Field>

              <Field data-invalid={!!errors.number} className="flex-[1_0_min(120px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="institution-number">Altura</FieldLabel>
                </FieldContent>
                <NumericInput
                  id="institution-number"
                  defaultValue={defaultValues.number}
                  maxLength={50}
                  placeholder="1174"
                  aria-invalid={!!errors.number}
                  {...register("number")}
                />
                <FieldError errors={[errors.number]} />
              </Field>

              <Field className="flex-[1_0_min(180px,100%)]">
                <FieldContent>
                  <FieldLabel htmlFor="institution-neighborhood">Barrio</FieldLabel>
                </FieldContent>
                <Input
                  id="institution-neighborhood"
                  defaultValue={defaultValues.neighborhood}
                  placeholder="Centro"
                  {...register("neighborhood")}
                />
              </Field>
            </FieldGroup>

            <Field className="flex w-full grow flex-col">
              <FieldContent className="grow-0">
                <FieldLabel htmlFor="institution-additional-info">Información adicional</FieldLabel>
              </FieldContent>
              <Textarea
                id="institution-additional-info"
                className="bg-background grow resize-none"
                defaultValue={defaultValues.additionalInfo}
                placeholder="Piso, oficina o indicaciones para llegar..."
                {...register("additionalInfo")}
              />
            </Field>
          </div>
        </FormCard>

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
      </div>

      <div className="border-border/40 flex flex-row flex-wrap items-center justify-end gap-3 border-t pt-5 pb-6">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={isPending}
          onClick={() => router.push(returnTo)}
        >
          Cancelar
        </Button>

        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-muted/25 flex flex-col gap-4 rounded-xl border p-5">
      <h2 className="text-foreground font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function getDefaultValues(institution: Institution): InstitutionalInstitutionFormInput {
  return {
    name: institution.name,
    cityId: institution.city.cityId,
    street: institution.street ?? "",
    number: institution.number ?? "",
    neighborhood: institution.neighborhood ?? "",
    additionalInfo: institution.additionalInfo ?? "",
    phoneNumber: institution.phoneNumber ?? "",
    email: institution.email ?? "",
  };
}

function getInitialLocation(institution: Institution): InitialLocation {
  return {
    country: {
      id: institution.country.countryId,
      isoCode: institution.country.isoCode,
      name: institution.country.name,
    },
    province: {
      id: institution.province.provinceId,
      name: institution.province.name,
    },
    city: {
      id: institution.city.cityId,
      name: institution.city.name,
      province: institution.province.name,
      provinceId: institution.province.provinceId,
    },
  };
}

function applyServerErrors(
  state: InstitutionActionState,
  setError: UseFormSetError<InstitutionalInstitutionFormInput>,
  setFormError: (error: string) => void,
): void {
  if (state.error) setFormError(state.error);
  if (!state.fieldErrors) return;

  for (const [field, message] of Object.entries(state.fieldErrors)) {
    if (message) {
      setError(field as keyof InstitutionalInstitutionFormInput, { type: "server", message });
    }
  }
}
