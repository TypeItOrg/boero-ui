"use client";

import { useState, useTransition, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlertIcon, Loader2Icon, UserRoundCogIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { FORM_MODE } from "@common/types/form-mode.types";
import { cn } from "@common/utils/cn.util";

import { createPlatformAccountAction } from "@features/platform-accounts/actions/create-platform-account.action";
import { updatePlatformAccountAction } from "@features/platform-accounts/actions/update-platform-account.action";
import { PlatformAccountFields } from "@features/platform-accounts/components/platform-account-fields";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";
import {
  platformAccountFormSchema,
  platformAccountUpdateFormSchema,
  type PlatformAccountFormInput,
  type PlatformAccountFormValues,
} from "@features/platform-accounts/schemas/platform-account-form.schema";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
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

export function PlatformAccountForm({ mode, account, returnTo }: PlatformAccountFormProps): ReactElement {
  const router = useRouter();
  const { account: currentAccount } = usePlatformAccount();
  const isEdit = mode === FORM_MODE.EDIT;
  const defaultDestination = isEdit ? `${PLATFORM_ACCOUNTS_PATH}/${account.platformAccountId}` : PLATFORM_ACCOUNTS_PATH;
  const destination = returnTo ?? defaultDestination;
  const isCurrentAccount = isEdit && currentAccount?.platformAccountId === account.platformAccountId;
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
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
            <SectionHeader icon={UserRoundCogIcon} title="Identidad y acceso" description={getSectionDescription(isEdit)} />
          </header>
          <PlatformAccountFields errors={errors} defaultValues={defaultValues} register={register} isEdit={isEdit} />
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
