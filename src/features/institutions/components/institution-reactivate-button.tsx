"use client";

import { useTransition } from "react";
import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { updateInstitutionStatusAction } from "@features/institutions/actions/update-institution-status.action";

type InstitutionReactivateButtonProps = {
  institutionId: string;
  institutionName: string;
};

export function InstitutionReactivateButton({
  institutionId,
  institutionName,
}: InstitutionReactivateButtonProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();

  function reactivateInstitution(): void {
    startTransition(async () => {
      try {
        const result = await updateInstitutionStatusAction(institutionId, true);

        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(`${institutionName} fue reactivada.`);
      } catch {
        toast.error(`No se pudo reactivar ${institutionName}.`);
      }
    });
  }

  return (
    <Button type="button" size="lg" onClick={reactivateInstitution} disabled={isPending}>
      {isPending ? (
        <Loader2Icon data-icon="inline-start" className="animate-spin" />
      ) : (
        <RotateCcwIcon data-icon="inline-start" />
      )}
      Reactivar institución
    </Button>
  );
}
