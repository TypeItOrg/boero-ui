"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormSetError } from "react-hook-form";
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
import { LocationPicker } from "@features/locations/components/location-picker";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import {
  institutionFormSchema,
  type InstitutionFormInput,
  type InstitutionFormValues,
} from "@features/institutions/schemas/institution-form.schema";
import { createInstitutionAction } from "@features/institutions/actions/create-institution.action";
import { updateInstitutionAction } from "@features/institutions/actions/update-institution.action";
import type { Institution } from "@features/institutions/types/institution.types";
import type { InstitutionActionState } from "@features/institutions/types/institution-action-state.types";
import type { InstitutionFormFieldName } from "@features/institutions/types/institution-form-field-name.types";
import { createInstitutionFormData } from "@features/institutions/utils/institution-form-data.util";
import { createInstitutionSlug } from "@features/institutions/utils/institution-slug.util";

const INSTITUTIONS_PATH = "/admin/institutions";

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
  returnTo?: string;
  id?: string;
  hideFooter?: boolean;
};
type InitialLocation = React.ComponentProps<typeof LocationPicker>["initialLocation"];

export function InstitutionForm({
  mode,
  institution,
  onSuccess,
  onCancel,
  returnTo = INSTITUTIONS_PATH,
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
          router.push(returnTo);
        }
      }
    });
  }

  function handleCancel(): void {
    if (onCancel) {
      onCancel();
    } else {
      router.push(returnTo);
    }
  }

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1.5 pb-4">
        {formError && (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{getErrorTitle(isEdit)}</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

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
        {isEdit ? <InstitutionStatusField active={active} onActiveChange={setActive} /> : null}
      </div>

      {!hideFooter && (
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
  return isEdit ? INSTITUTION_ERROR_MESSAGES.UPDATE_TITLE : INSTITUTION_ERROR_MESSAGES.CREATE_TITLE;
}

function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return "Guardando...";
  if (isEdit) return "Guardar cambios";

  return "Crear institución";
}
