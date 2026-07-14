"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CircleAlertIcon, InfoIcon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { updatePlatformAccountStatusAction } from "@features/platform-accounts/actions/update-platform-account-status.action";

type PlatformAccountStatusControlProps = {
  accountId: string;
  enabled: boolean;
  isCurrentAccount: boolean;
};

export function PlatformAccountStatusControl({
  accountId,
  enabled,
  isCurrentAccount,
}: PlatformAccountStatusControlProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();
  const nextEnabled = !enabled;

  function updateStatus(): void {
    setError(undefined);
    startTransition(async () => {
      const result = await updatePlatformAccountStatusAction(accountId, nextEnabled);
      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {isCurrentAccount && enabled ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>Esta es tu cuenta</AlertTitle>
          <AlertDescription>No podés deshabilitar la cuenta con la que estás trabajando.</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo cambiar el estado</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-end">
        <Button
          variant={enabled ? "destructive" : "default"}
          onClick={updateStatus}
          disabled={isPending || (isCurrentAccount && enabled)}
        >
          {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
          {getStatusActionLabel(enabled, isPending)}
        </Button>
      </div>
    </div>
  );
}

function getStatusActionLabel(enabled: boolean, isPending: boolean): string {
  if (isPending) return enabled ? "Deshabilitando..." : "Habilitando...";
  return enabled ? "Deshabilitar administrador" : "Habilitar administrador";
}
