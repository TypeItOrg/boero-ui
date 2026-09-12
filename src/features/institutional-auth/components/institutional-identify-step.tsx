"use client";

import { startTransition, useActionState, type SyntheticEvent } from "react";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";
import { cn } from "@common/utils/cn.util";
import { identifyInstitutionalUser } from "@features/institutional-auth/actions/identify-institutional-user.action";
import { InstitutionPicker, type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import type { InstitutionalIdentifyActionState } from "@features/institutional-auth/types/institutional-identify-state.types";
import type { InstitutionalLoginAttempt } from "@features/institutional-auth/types/institutional-login-attempt.types";

type InstitutionalIdentifyStepProps = {
  documentNumber: string;
  revision: number;
  identified: boolean;
  disabled: boolean;
  onDocumentChange: (value: string) => void;
  emailVerified: boolean;
  showPasswordChanged: boolean;
  institution: InstitutionalInstitution | undefined;
  onInstitutionChange: (institution: InstitutionalInstitution | undefined) => void;
  onIdentified: (result: InstitutionalLoginAttempt, revision: number) => void;
};

export function InstitutionalIdentifyStep({
  documentNumber,
  revision,
  identified,
  disabled,
  onDocumentChange,
  emailVerified,
  showPasswordChanged,
  institution,
  onInstitutionChange,
  onIdentified,
}: InstitutionalIdentifyStepProps): React.ReactElement {
  const [state, identifyAction, isIdentifyPending] = useActionState<
    InstitutionalIdentifyActionState & { revision?: number },
    { formData: FormData; revision: number }
  >(async (previous, submitted) => {
    const { formData, revision: submittedRevision } = submitted;
    const result = await identifyInstitutionalUser(previous, formData);
    if (result.loginAttemptId && result.nextStep) {
      onIdentified({ loginAttemptId: result.loginAttemptId, nextStep: result.nextStep }, submittedRevision);
    }
    return { ...result, revision: submittedRevision };
  }, {});
  const identifyState = state.revision === revision ? state : {};
  const hasFieldErrors = Object.keys(identifyState.fieldErrors ?? {}).length > 0;
  const canShowSuccessMessage = !identified && !isIdentifyPending && !identifyState.error && !hasFieldErrors;

  function handleIdentifySubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (identified || disabled || isIdentifyPending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => identifyAction({ formData, revision }));
  }

  return (
    <form onSubmit={handleIdentifySubmit}>
      <div className="space-y-6">
        {emailVerified && canShowSuccessMessage ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>¡Listo! Correo electrónico confirmado</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_VERIFIED}</AlertDescription>
          </Alert>
        ) : null}

        {showPasswordChanged && canShowSuccessMessage ? (
          <Alert variant="success">
            <CheckCircle2Icon className="size-4" />
            <AlertTitle>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_TITLE}</AlertTitle>
            <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_DESCRIPTION}</AlertDescription>
          </Alert>
        ) : null}

        {identifyState.error ? (
          <Alert variant="destructive">
            <AlertCircleIcon className="size-4" />
            <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
            <AlertDescription>{identifyState.error}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup>
          <Field data-invalid={!!identifyState.fieldErrors?.institutionId}>
            <FieldLabel htmlFor="institution-id" required>
              Institución
            </FieldLabel>
            <input name="institutionName" type="hidden" value={institution?.name ?? ""} />
            <InstitutionPicker
              ariaInvalid={!!identifyState.fieldErrors?.institutionId}
              disabled={disabled}
              id="institution-id"
              onValueChange={(_, item) => onInstitutionChange(item)}
              selectedLabel={institution?.name}
              value={institution?.id}
            />
            <FieldError errors={identifyState.fieldErrors?.institutionId ? [{ message: identifyState.fieldErrors.institutionId }] : undefined} />
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field data-invalid={!!identifyState.fieldErrors?.documentNumber}>
            <FieldLabel htmlFor="document-number" required>
              Documento
            </FieldLabel>
            <NumericInput
              aria-invalid={!!identifyState.fieldErrors?.documentNumber}
              value={documentNumber}
              disabled={disabled}
              onChange={(event) => onDocumentChange(event.target.value)}
              autoComplete="username"
              id="document-number"
              maxLength={8}
              name="documentNumber"
            />
            <FieldError errors={identifyState.fieldErrors?.documentNumber ? [{ message: identifyState.fieldErrors.documentNumber }] : undefined} />
          </Field>
        </FieldGroup>

        {!identified ? (
          <footer className="mt-6 flex w-full flex-col gap-4">
            <Button aria-busy={isIdentifyPending} className="relative w-full" disabled={isIdentifyPending} size="lg" type="submit">
              <span className={cn("inline-flex items-center gap-[inherit] transition-opacity", isIdentifyPending && "opacity-0")}>Continuar</span>
              {isIdentifyPending ? (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit]">
                  <Loader2Icon aria-hidden="true" className="animate-spin" />
                  <span className="sr-only" role="status" aria-live="polite">
                    Continuando...
                  </span>
                </span>
              ) : null}
            </Button>
          </footer>
        ) : null}
      </div>
    </form>
  );
}
