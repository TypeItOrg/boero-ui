import { CircleAlertIcon, CheckCircle2Icon } from "lucide-react";
import { Alert, AlertDescription } from "@common/components/ui/alert";

export function InstitutionBrandingFeedback({
  error,
  success,
  successMessage,
}: {
  error?: string;
  success?: boolean;
  successMessage: string;
}): React.ReactElement | null {
  if (!error && !success) {
    return null;
  }
  return (
    <Alert variant={error ? "destructive" : "success"} aria-live="polite">
      {error ? <CircleAlertIcon /> : <CheckCircle2Icon />}
      <AlertDescription>{error ?? successMessage}</AlertDescription>
    </Alert>
  );
}
