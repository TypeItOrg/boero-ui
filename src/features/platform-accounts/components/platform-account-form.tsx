"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon, UserRoundCogIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { cn } from "@common/utils/cn.util";
import { createPlatformAccountAction } from "@features/platform-accounts/actions/create-platform-account.action";
import { updatePlatformAccountAction } from "@features/platform-accounts/actions/update-platform-account.action";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";
import {
  platformAccountFormSchema,
  platformAccountUpdateFormSchema,
  type PlatformAccountFormInput,
  type PlatformAccountFormValues,
} from "@features/platform-accounts/schemas/platform-account-form.schema";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import { FORM_MODE } from "@common/types/form-mode.types";
import {
  createFormData,
  getDefaultValues,
  getSectionDescription,
  getSubmitLabel,
  hasSensitiveChanges,
  setActionFieldErrors,
} from "@features/platform-accounts/utils/platform-account-form.util";
import { logoutPlatform } from "@features/platform-auth/actions/platform-logout.action";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

const PLATFORM_ACCOUNTS_PATH = "/admin/accounts";

type CreateMode = {
  mode: typeof FORM_MODE.CREATE;
  account?: never;
};

type EditMode = {
  mode: typeof FORM_MODE.EDIT;
  account: PlatformAccountAdmin;
};

type PlatformAccountFormProps = (CreateMode | EditMode) & {
  returnTo?: string;
};

export function PlatformAccountForm({ mode, account, returnTo }: PlatformAccountFormProps): React.ReactElement {
  const router = useRouter();
  const { account: currentAccount } = usePlatformAccount();
  const isEdit = mode === FORM_MODE.EDIT;
  const defaultDestination = isEdit ? `${PLATFORM_ACCOUNTS_PATH}/${account.platformAccountId}` : PLATFORM_ACCOUNTS_PATH;
  const destination = returnTo ?? defaultDestination;
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
      <AlertTitle>{isEdit ? PLATFORM_ACCOUNT_ERROR_MESSAGES.UPDATE_TITLE : PLATFORM_ACCOUNT_ERROR_MESSAGES.CREATE_TITLE}</AlertTitle>
      <AlertDescription>{formError}</AlertDescription>
    </Alert>
  ) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {errorAlert}

        <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
          <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
            <div className="flex items-center gap-3.5">
              <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
                <UserRoundCogIcon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Identidad y acceso</h2>
                <p className="text-muted-foreground text-sm">{getSectionDescription(isEdit)}</p>
              </div>
            </div>
          </header>
          <FieldGroup className="mt-5 gap-4">
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
                  {isEdit ? "Dejala vacía para conservar la contraseña actual." : "Debe tener al menos 8 caracteres y será definitiva por ahora."}
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
          </FieldGroup>
        </section>
      </div>

      <div
        className={cn(
          "mt-auto flex items-center justify-end gap-3",
          isEdit ? "border-border/40 border-t pt-5 pb-6" : "bg-background sticky bottom-0 z-10 flex-row flex-wrap",
        )}
      >
        <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={handleCancel} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={isPending}>
          {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
          {getSubmitLabel({ isEdit, isPending })}
        </Button>
      </div>
    </form>
  );
}
