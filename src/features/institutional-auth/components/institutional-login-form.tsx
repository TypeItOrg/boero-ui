"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { Field, FieldError, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";

import { InstitutionalAuthInstitutionField } from "@features/institutional-auth/components/institutional-auth-institution-field";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { InstitutionalLoginFeedback } from "@features/institutional-auth/components/institutional-login-feedback";
import { InstitutionalPasskeyStep } from "@features/institutional-auth/components/institutional-passkey-step";
import { InstitutionalPasswordLoginFields } from "@features/institutional-auth/components/institutional-password-login-fields";
import { useInstitutionalLogin } from "@features/institutional-auth/hooks/use-institutional-login";

type InstitutionalLoginFormProps = { emailVerified?: boolean; passwordChanged?: boolean };

export function InstitutionalLoginForm(props: InstitutionalLoginFormProps): ReactElement {
  const {
    institution,
    documentNumber,
    method,
    revision,
    rememberMe,
    status,
    notices,
    fieldErrors,
    showNotice,
    activeInstitution,
    changeDocument,
    changeInstitution,
    changeMethod,
    submitPassword,
    setRememberMe,
    setPending,
    setError,
    setPasskeyFieldErrors,
    isCurrentIdentity,
  } = useInstitutionalLogin(props);

  return (
    <div className="flex flex-col justify-center p-5 sm:p-8">
      <InstitutionalAuthStepHeader
        title="Bienvenido de nuevo"
        showInstitutionName={false}
        description="Ingresá con tu contraseña o una llave de acceso."
      />
      <form className="mt-6 space-y-6" onSubmit={submitPassword} noValidate>
        <InstitutionalLoginFeedback
          showEmailVerified={notices.emailVerified}
          showPasswordChanged={notices.passwordChanged}
          showNotice={showNotice}
          error={status.error}
        />
        <InstitutionalAuthInstitutionField
          id="institution-id"
          institution={institution}
          onChange={changeInstitution}
          disabled={status.pending}
          error={fieldErrors?.institutionId}
        />
        <Field data-invalid={Boolean(fieldErrors?.documentNumber)}>
          <FieldLabel htmlFor="document-number">Documento</FieldLabel>
          <NumericInput
            id="document-number"
            name="documentNumber"
            value={documentNumber}
            onChange={(event) => changeDocument(event.target.value)}
            disabled={status.pending}
            autoComplete="username"
            maxLength={8}
            aria-invalid={Boolean(fieldErrors?.documentNumber)}
          />
          <FieldError errors={fieldErrors?.documentNumber ? [{ message: fieldErrors.documentNumber }] : undefined} />
        </Field>
        {method === "PASSWORD" ? (
          <InstitutionalPasswordLoginFields
            fieldErrors={fieldErrors}
            status={status}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
            changeMethod={changeMethod}
          />
        ) : (
          <InstitutionalPasskeyStep
            key={revision}
            isCurrentIdentity={() => isCurrentIdentity()}
            input={{
              institutionId: activeInstitution?.id ?? "",
              institutionName: activeInstitution?.name,
              documentNumber,
            }}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
            onPendingChange={setPending}
            onError={setError}
            onFieldErrors={setPasskeyFieldErrors}
            onUsePassword={() => changeMethod("PASSWORD")}
          />
        )}
        <p className="text-muted-foreground text-center text-sm">
          ¿No tenés una cuenta?{" "}
          <Link className="text-primary font-medium underline underline-offset-4" href="/auth/register">
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
