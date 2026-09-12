"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { PasswordInput } from "@common/components/ui/password-input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { NumericInput } from "@common/components/ui/restricted-input";
import { InstitutionPicker } from "@features/institutional-auth/components/institution-picker";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { EmailVerificationFeedback } from "@features/institutional-auth/components/email-verification-feedback";
import { changePendingEmail, resendEmailVerification } from "@features/institutional-auth/actions/email-verification.actions";
import type { EmailVerificationContext } from "@features/institutional-auth/types/email-verification-context.types";
import type { EmailVerificationState } from "@features/institutional-auth/types/email-verification-state.types";

export function EmailVerificationForm({ context }: { context?: EmailVerificationContext }): React.ReactElement {
  const [mode, setMode] = useState<"resend" | "change">("resend");
  const initialIdentity = context?.institutionName ? context : context ? { ...context, institutionId: "" } : undefined;
  const [identity, setIdentity] = useState(initialIdentity);
  return (
    <div className="flex flex-col">
      <div className="flex-1 p-5 sm:p-8">
        <InstitutionalAuthStepHeader
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

function VerificationRequestForm({
  mode,
  identity,
  onIdentityChange,
  onModeChange,
}: {
  mode: "resend" | "change";
  identity?: EmailVerificationContext;
  onIdentityChange: (value: EmailVerificationContext) => void;
  onModeChange: (value: "resend" | "change") => void;
}): React.ReactElement {
  const [state, action, pending] = useActionState<EmailVerificationState, FormData>(
    mode === "resend" ? resendEmailVerification : changePendingEmail,
    {},
  );
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="mt-6 space-y-5">
      <EmailVerificationFeedback
        state={state}
        successMessage={
          mode === "resend"
            ? "Si tu cuenta está pendiente, recibirás un enlace."
            : "Actualizamos tu correo electrónico. Revisá esa casilla y usá el último enlace que recibas."
        }
      />
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.institutionId}>
          <FieldLabel htmlFor="verification-institution" required>
            Institución
          </FieldLabel>
          <InstitutionPicker
            id="verification-institution"
            disabled={pending}
            value={identity?.institutionId}
            selectedLabel={identity?.institutionName}
            ariaInvalid={!!state.fieldErrors?.institutionId}
            onValueChange={(value, item) =>
              onIdentityChange({ institutionId: value ?? "", institutionName: item?.name, documentNumber: identity?.documentNumber ?? "" })
            }
          />
          <FieldError>{state.fieldErrors?.institutionId}</FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.documentNumber}>
          <FieldLabel htmlFor="verification-document" required>
            Documento
          </FieldLabel>
          <NumericInput
            id="verification-document"
            name="documentNumber"
            maxLength={8}
            autoComplete="username"
            disabled={pending}
            value={identity?.documentNumber ?? ""}
            aria-invalid={!!state.fieldErrors?.documentNumber}
            onChange={(event) => onIdentityChange({ ...identity, institutionId: identity?.institutionId ?? "", documentNumber: event.target.value })}
          />
          <FieldError>{state.fieldErrors?.documentNumber}</FieldError>
        </Field>
        {mode === "change" ? (
          <>
            <Field data-invalid={!!state.fieldErrors?.email}>
              <FieldLabel htmlFor="verification-email" required>
                Nuevo correo electrónico
              </FieldLabel>
              <Input
                id="verification-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={150}
                disabled={pending}
                aria-invalid={!!state.fieldErrors?.email}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <FieldError>{state.fieldErrors?.email}</FieldError>
            </Field>
            <Field data-invalid={!!state.fieldErrors?.password}>
              <FieldLabel htmlFor="verification-password" required>
                Contraseña de tu cuenta
              </FieldLabel>
              <PasswordInput
                id="verification-password"
                name="password"
                autoComplete="current-password"
                maxLength={255}
                disabled={pending}
                aria-invalid={!!state.fieldErrors?.password}
              />
              <FieldError>{state.fieldErrors?.password}</FieldError>
            </Field>
          </>
        ) : null}
      </FieldGroup>
      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : null}
          {pending ? "Enviando…" : mode === "resend" ? "Reenviar enlace" : "Cambiar correo electrónico y enviar enlace"}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          {mode === "resend" ? "¿Necesitás usar otro correo electrónico?" : "¿No necesitás cambiarlo?"}{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline font-medium"
            disabled={pending}
            onClick={() => onModeChange(mode === "resend" ? "change" : "resend")}
          >
            {mode === "resend" ? "Cambiar correo electrónico" : "Volver al reenvío"}
          </Button>
        </p>
      </div>
    </form>
  );
}
