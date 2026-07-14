"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon } from "lucide-react";

import { cn } from "@common/utils/cn.util";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { Textarea } from "@common/components/ui/textarea";
import { Switch } from "@common/components/ui/switch";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { LocationPicker } from "@features/locations/components/location-picker";
import {
  institutionFormSchema,
  type InstitutionFormInput,
  type InstitutionFormValues,
} from "../schemas/institution-form.schema";
import { createInstitutionAction } from "../actions/create-institution.action";
import { updateInstitutionAction } from "../actions/update-institution.action";
import type { Institution } from "../types/institution.types";
import type { InstitutionActionState, InstitutionFormFieldName } from "../types/institution-action-state.types";
import { createInstitutionFormData } from "../utils/institution-form-data.util";
import { createInstitutionSlug } from "../utils/institution-slug.util";

const INSTITUTIONS_PATH = "/platform/institutions";

const EMPTY_FORM_VALUES: InstitutionFormInput = {
  name: "",
  slug: "",
  cityId: "",
  street: "",
  number: "",
  neighborhood: "",
  additionalInfo: "",
  phoneNumber: "",
  email: "",
};

type CreateMode = {
  mode: "create";
  institution?: never;
};

type EditMode = {
  mode: "edit";
  institution: Institution;
};

type InstitutionFormProps = (CreateMode | EditMode) & {
  onSuccess?: () => void;
  onCancel?: () => void;
  id?: string;
  hideFooter?: boolean;
};
type InitialLocation = React.ComponentProps<typeof LocationPicker>["initialLocation"];

export function InstitutionForm({
  mode,
  institution,
  onSuccess,
  onCancel,
  id,
  hideFooter = false,
}: InstitutionFormProps): React.ReactElement {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const hasManuallyEditedSlug = React.useRef(isEdit);

  const [active, setActive] = React.useState(institution?.active ?? true);
  const initialLocation = React.useMemo(() => getInitialLocation(institution), [institution]);
  const defaultValues = React.useMemo(() => getDefaultValues(institution), [institution]);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useForm<InstitutionFormInput, unknown, InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues,
  });
  const nameField = register("name");
  const slugField = register("slug");

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>): void {
    nameField.onChange(event);

    if (hasManuallyEditedSlug.current) return;

    setValue("slug", createInstitutionSlug(event.target.value), {
      shouldDirty: true,
      shouldValidate: !!errors.slug,
    });
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>): void {
    hasManuallyEditedSlug.current = true;
    slugField.onChange(event);
  }

  function onSubmit(values: InstitutionFormValues): void {
    setFormError(undefined);

    startTransition(async () => {
      const formData = createInstitutionFormData(values, isEdit ? active : undefined);
      const result = isEdit
        ? await updateInstitutionAction(institution.id, formData)
        : await createInstitutionAction(formData);

      const hasFieldErrors = setActionFieldErrors(result, setError);
      setFormError(hasFieldErrors ? undefined : result.error);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(INSTITUTIONS_PATH);
        }
      }
    });
  }

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1.5 pb-4">
        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{getErrorTitle(isEdit)}</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <FormCard>
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!errors.name} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="institution-name" required>
                  Nombre
                </FieldLabel>
              </FieldContent>
              <Input
                id="institution-name"
                defaultValue={defaultValues.name}
                maxLength={255}
                placeholder="Conservatorio Superior de Música"
                aria-invalid={!!errors.name}
                {...nameField}
                onChange={handleNameChange}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.slug} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="institution-slug" required>
                  Slug
                </FieldLabel>
              </FieldContent>
              <Input
                id="institution-slug"
                defaultValue={defaultValues.slug}
                maxLength={100}
                aria-invalid={!!errors.slug}
                {...slugField}
                onChange={handleSlugChange}
              />
              <FieldError errors={[errors.slug]} />
            </Field>
          </FieldGroup>
        </FormCard>

        <FormCard className="flex grow flex-col">
          <div className="flex grow flex-col gap-5">
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
                <Input
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

        <FormCard>
          <FieldGroup className="flex flex-row flex-wrap items-start gap-4">
            <Field data-invalid={!!errors.phoneNumber} className="flex-[1_0_min(200px,100%)]">
              <FieldContent>
                <FieldLabel htmlFor="institution-phone">Teléfono</FieldLabel>
              </FieldContent>
              <Input
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

        {isEdit && (
          <FormCard>
            <FieldGroup>
              <Field orientation="horizontal" className="bg-background rounded-lg border p-4">
                <FieldContent>
                  <FieldLabel htmlFor="institution-active">Institución activa</FieldLabel>
                  <FieldDescription>
                    Las instituciones inactivas no están disponibles para el acceso de usuarios.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="institution-active"
                  checked={active}
                  onCheckedChange={setActive}
                  aria-label="Estado de la institución"
                />
              </Field>
            </FieldGroup>
          </FormCard>
        )}
      </div>

      {!hideFooter && (
        <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-[1_0_min(140px,100%)] sm:flex-none"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          ) : (
            <Button
              asChild
              type="button"
              variant="outline"
              size="lg"
              className="flex-[1_0_min(140px,100%)] sm:flex-none"
              disabled={isPending}
            >
              <NavigationLink href={INSTITUTIONS_PATH}>Cancelar</NavigationLink>
            </Button>
          )}
          <Button type="submit" size="lg" className="flex-[1_0_min(140px,100%)] sm:flex-none" disabled={isPending}>
            {getSubmitLabel({ isEdit, isPending })}
          </Button>
        </div>
      )}
    </form>
  );
}

function FormCard({ children, className }: { children: React.ReactNode; className?: string }): React.ReactElement {
  return <div className={cn("bg-muted/25 rounded-xl border p-5 md:p-6", className)}>{children}</div>;
}

function getInitialLocation(institution: Institution | undefined): InitialLocation {
  if (!institution) return undefined;

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

function getDefaultValues(institution: Institution | undefined): InstitutionFormInput {
  if (!institution) return { ...EMPTY_FORM_VALUES };

  return {
    name: institution.name,
    slug: institution.slug,
    cityId: institution.city.cityId,
    street: institution.street ?? "",
    number: institution.number ?? "",
    neighborhood: institution.neighborhood ?? "",
    additionalInfo: institution.additionalInfo ?? "",
    phoneNumber: institution.phoneNumber ?? "",
    email: institution.email ?? "",
  };
}

function setActionFieldErrors(
  result: InstitutionActionState,
  setError: UseFormSetError<InstitutionFormInput>,
): boolean {
  if (!result.fieldErrors) return false;

  let hasFieldErrors = false;

  for (const [field, message] of Object.entries(result.fieldErrors)) {
    if (message) {
      setError(field as InstitutionFormFieldName, { message });
      hasFieldErrors = true;
    }
  }

  return hasFieldErrors;
}

function getErrorTitle(isEdit: boolean): string {
  return isEdit ? "No se pudo actualizar la institución" : "No se pudo crear la institución";
}

function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return "Guardando...";
  if (isEdit) return "Guardar cambios";

  return "Crear institución";
}
