"use client";

import { useState, type ReactElement } from "react";

import Link from "next/link";

import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { useInstitutionalBrand } from "@features/institutional-auth/components/institutional-brand-context";
import { VerificationRequestForm } from "@features/institutional-auth/components/verification-request-form";
import type { EmailVerificationContext } from "@features/institutional-auth/types/email-verification-context.types";

export function EmailVerificationForm({ context }: { context?: EmailVerificationContext }): ReactElement {
  const [mode, setMode] = useState<"resend" | "change">("resend");
  const institution = useInstitutionalBrand();

  const initialIdentity = institution
    ? {
        institutionId: institution.id,
        institutionName: institution.name,
        documentNumber: context?.institutionId === institution.id ? context.documentNumber : "",
      }
    : context?.institutionName
      ? context
      : context
        ? { ...context, institutionId: "" }
        : undefined;

  const [identity, setIdentity] = useState(initialIdentity);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-8">
        <InstitutionalAuthStepHeader
          showInstitutionName={false}
          title={mode === "resend" ? "Verificá tu correo electrónico" : "Cambiá tu correo electrónico"}
          description={
            mode === "resend"
              ? "Ingresá tus datos para recibir un nuevo enlace de verificación."
              : "Confirmá tu identidad e indicá el correo electrónico correcto para recibir un nuevo enlace."
          }
        />
        <VerificationRequestForm key={mode} mode={mode} identity={identity} onIdentityChange={setIdentity} onModeChange={setMode} />
      </div>

      <footer className="text-muted-foreground flex min-h-[4.5rem] items-center justify-center gap-1 border-t px-5 text-center text-sm sm:px-8">
        <span>¿Ya verificaste tu cuenta?</span>
        <Link href="/auth/login" className="text-primary font-medium underline underline-offset-4">
          Iniciar sesión
        </Link>
      </footer>
    </div>
  );
}
