"use client";

import type { ReactElement } from "react";

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";

import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export function InstitutionalLoginFeedback({
  showEmailVerified,
  showPasswordChanged,
  showNotice,
  error,
}: {
  showEmailVerified: boolean;
  showPasswordChanged: boolean;
  showNotice: boolean;
  error: string | null;
}): ReactElement {
  return (
    <>
      {" "}
      {showEmailVerified && showNotice ? (
        <Alert variant="success">
          <CheckCircle2Icon className="size-4" />
          <AlertTitle>¡Listo! Correo electrónico confirmado</AlertTitle>
          <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.EMAIL_VERIFIED}</AlertDescription>
        </Alert>
      ) : null}
      {showPasswordChanged && showNotice ? (
        <Alert variant="success">
          <CheckCircle2Icon className="size-4" />
          <AlertTitle>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_TITLE}</AlertTitle>
          <AlertDescription>{INSTITUTIONAL_AUTH_ERROR_MESSAGES.PASSWORD_CHANGED_DESCRIPTION}</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>¡Ups! Algo salió mal</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
