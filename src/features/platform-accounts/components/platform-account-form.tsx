"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon } from "lucide-react";
import { useForm, type UseFormSetError } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { cn } from "@common/utils/cn.util";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";
import { createPlatformAccountAction } from "@features/platform-accounts/actions/create-platform-account.action";
import { updatePlatformAccountAction } from "@features/platform-accounts/actions/update-platform-account.action";
import {
  platformAccountFormSchema,
  platformAccountUpdateFormSchema,
  type PlatformAccountFormInput,
  type PlatformAccountFormValues,
} from "@features/platform-accounts/schemas/platform-account-form.schema";
import type {
  PlatformAccountActionState,
  PlatformAccountFormFieldName,
} from "@features/platform-accounts/types/platform-account-action-state.types";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account.types";
import { logoutPlatform } from "@features/platform-auth/actions/platform-logout.action";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

const PLATFORM_ACCOUNTS_PATH = "/platform/accounts";
const EMPTY_FORM_VALUES: PlatformAccountFormInput = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type CreateMode = {
  mode: "create";
  account?: never;
};

type EditMode = {
  mode: "edit";
  account: PlatformAccountAdmin;
};

type PlatformAccountFormProps = CreateMode | EditMode;

export function PlatformAccountForm({ mode, account }: PlatformAccountFormProps): React.ReactElement {
  const router = useRouter();
  const { account: currentAccount } = usePlatformAccount();
  const isEdit = mode === "edit";
  const isCurrentAccount = isEdit && currentAccount?.platformAccountId === account.platformAccountId;
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string>();
  const defaultValues = getDefaultValues(account);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlatformAccountFormInput, unknown, PlatformAccountFormValues>({
    resolver: zodResolver(isEdit ? platformAccountUpdateFormSchema : platformAccountFormSchema),
    defaultValues,
  });

  function onSubmit(values: PlatformAccountFormValues): void {
    setFormError(undefined);

    startTransition(async () => {
      const result = isEdit
        ? await updatePlatformAccountAction(account.platformAccountId, createFormData(values))
        : await createPlatformAccountAction(createFormData(values));
      const hasFieldErrors = setActionFieldErrors(result, setError);
      setFormError(hasFieldErrors ? undefined : result.error);

      if (result.success) {
        if (isEdit && isCurrentAccount && hasSensitiveChanges(values, account)) {
          await logoutPlatform();
          return;
        }

        router.push(isEdit ? `${PLATFORM_ACCOUNTS_PATH}/${account.platformAccountId}` : PLATFORM_ACCOUNTS_PATH);
      }
    });
  }

  function handleCancel(): void {
    router.push(isEdit ? `${PLATFORM_ACCOUNTS_PATH}/${account.platformAccountId}` : PLATFORM_ACCOUNTS_PATH);
  }

  const errorAlert = formError ? (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>
        {isEdit ? PLATFORM_ACCOUNT_ERROR_MESSAGES.UPDATE_TITLE : PLATFORM_ACCOUNT_ERROR_MESSAGES.CREATE_TITLE}
      </AlertTitle>
      <AlertDescription>{formError}</AlertDescription>
    </Alert>
  ) : null;

  const fields = (
    <>
      <FieldGroup className="grid items-start gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="platform-account-name" required>
            Nombre
          </FieldLabel>
          <Input
            id="platform-account-name"
            defaultValue={defaultValues.name}
            maxLength={255}
            autoComplete="given-name"
            placeholder="María"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="platform-account-last-name" required>
            Apellido
          </FieldLabel>
          <Input
            id="platform-account-last-name"
            defaultValue={defaultValues.lastName}
            maxLength={255}
            autoComplete="family-name"
            placeholder="González"
            aria-invalid={!!errors.lastName}
            {...register("lastName")}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </FieldGroup>

      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="platform-account-email" required>
          Correo electrónico
        </FieldLabel>
        <Input
          id="platform-account-email"
          defaultValue={defaultValues.email}
          type="email"
          maxLength={150}
          autoComplete="email"
          placeholder="administracion@boero.edu.ar"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        <FieldDescription>Se utilizará para iniciar sesión en la plataforma.</FieldDescription>
        <FieldError errors={[errors.email]} />
      </Field>

      <FieldGroup className="grid items-start gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="platform-account-password" required={!isEdit}>
            {isEdit ? "Nueva contraseña" : "Contraseña"}
          </FieldLabel>
          <Input
            id="platform-account-password"
            type="password"
            minLength={8}
            maxLength={255}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldDescription>
            {isEdit
              ? "Dejala vacía para conservar la contraseña actual."
              : "Debe tener al menos 8 caracteres y será definitiva por ahora."}
          </FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="platform-account-confirm-password" required={!isEdit}>
            {isEdit ? "Confirmar nueva contraseña" : "Confirmar contraseña"}
          </FieldLabel>
          <Input
            id="platform-account-confirm-password"
            type="password"
            maxLength={255}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>
    </>
  );

  const actions = (
    <>
      <Button
        type="button"
        variant="outline"
        size={isEdit ? "default" : "lg"}
        className={cn(!isEdit && "flex-[1_0_min(140px,100%)] sm:flex-none")}
        onClick={handleCancel}
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        size={isEdit ? "default" : "lg"}
        className={cn(!isEdit && "flex-[1_0_min(140px,100%)] sm:flex-none")}
        disabled={isPending}
      >
        {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
        {getSubmitLabel({ isEdit, isPending })}
      </Button>
    </>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4">
        {errorAlert}

        <FormSection>
          <SectionHeading title="Identidad y acceso" description={getSectionDescription(isEdit)} />
          <FieldGroup className="mt-5 gap-5">{fields}</FieldGroup>
        </FormSection>
      </div>

      <div
        className={cn(
          "mt-auto flex items-center justify-end gap-3",
          isEdit ? "border-border/40 border-t pt-5 pb-6" : "bg-background sticky bottom-0 z-10 flex-row flex-wrap",
        )}
      >
        {actions}
      </div>
    </form>
  );
}

function getSectionDescription(isEdit: boolean): string {
  return isEdit
    ? "Actualizá la identidad del administrador o definí una nueva contraseña."
    : "El administrador quedará habilitado desde el momento de su creación.";
}

function SectionHeading({ title, description }: { title: string; description: string }): React.ReactElement {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </div>
  );
}

function FormSection({ children }: React.PropsWithChildren): React.ReactElement {
  return <div className="bg-muted/25 rounded-xl border p-5 md:p-6">{children}</div>;
}

function getDefaultValues(account: PlatformAccountAdmin | undefined): PlatformAccountFormInput {
  if (!account) return EMPTY_FORM_VALUES;

  return {
    name: account.name,
    lastName: account.lastName,
    email: account.email,
    password: "",
    confirmPassword: "",
  };
}

function hasSensitiveChanges(values: PlatformAccountFormValues, account: PlatformAccountAdmin): boolean {
  const emailChanged = values.email.toLowerCase() !== account.email.toLowerCase();
  return emailChanged || values.password !== "";
}

function getSubmitLabel({ isEdit, isPending }: { isEdit: boolean; isPending: boolean }): string {
  if (isPending) return isEdit ? "Guardando..." : "Creando...";
  return isEdit ? "Guardar cambios" : "Crear administrador";
}

function createFormData(values: PlatformAccountFormValues): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([field, value]) => formData.set(field, value));
  return formData;
}

function setActionFieldErrors(
  result: PlatformAccountActionState,
  setError: UseFormSetError<PlatformAccountFormInput>,
): boolean {
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
