"use client";

import { useActionState, type ReactElement } from "react";

import Link from "next/link";

import { Loader2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { confirmEmailVerification } from "@features/institutional-auth/actions/email-verification.actions";
import { EmailVerificationFeedback } from "@features/institutional-auth/components/email-verification-feedback";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import type { EmailVerificationState } from "@features/institutional-auth/types/email-verification-state.types";

export function ConfirmEmailVerificationForm({ token }: { token?: string }): ReactElement {
  const [state, action, pending] = useActionState<EmailVerificationState, FormData>(confirmEmailVerification, {});

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-8">
        <InstitutionalAuthStepHeader
          showInstitutionName={false}
          title={token ? "Confirmá tu correo electrónico" : "Enlace inválido"}
          description={
            token
              ? "Confirmá que esta dirección de correo electrónico te pertenece para completar el registro. Una vez verificada, tu cuenta quedará habilitada y vas a poder iniciar sesión."
              : "Este enlace no se puede usar. Solicitá uno nuevo para continuar."
          }
        />

        <div className="mt-7 space-y-6">
          <EmailVerificationFeedback state={{ error: state.error }} />

          {token ? (
            <form action={action}>
              <input type="hidden" name="token" value={token} />
              <Button type="submit" className="w-full" size="lg" disabled={pending} aria-busy={pending}>
                {pending ? <Loader2Icon className="animate-spin" /> : null}
                {pending ? "Confirmando…" : "Confirmar correo electrónico"}
              </Button>
            </form>
          ) : null}

          <p className="text-muted-foreground text-center text-sm">
            ¿El enlace venció o no funciona?{" "}
            <Link href="/auth/email-verification" className="text-primary font-medium underline underline-offset-4">
              Solicitar uno nuevo
            </Link>
          </p>
        </div>
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
