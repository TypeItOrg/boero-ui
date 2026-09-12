import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import type { EmailVerificationState } from "@features/institutional-auth/types/email-verification-state.types";

export function EmailVerificationFeedback({
  state,
  successMessage,
}: {
  state: EmailVerificationState;
  successMessage?: string;
}): React.ReactElement | null {
  if (!state.error && !state.success) return null;
  return (
    <Alert variant={state.error ? "destructive" : "success"} aria-live="polite">
      {state.error ? <AlertCircleIcon /> : <CheckCircle2Icon />}
      <AlertTitle>{state.error ? "No pudimos completar la solicitud" : "Solicitud completada"}</AlertTitle>
      <AlertDescription>{state.error ?? successMessage}</AlertDescription>
    </Alert>
  );
}
