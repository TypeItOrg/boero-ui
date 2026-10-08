"use client";

import { useTransition, type ReactElement } from "react";

import { Loader2Icon, RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { safelyRunAction } from "@common/utils/safe-action.util";

import { updateInstitutionStatusAction } from "@features/institutions/actions/update-institution-status.action";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";

type InstitutionReactivateButtonProps = {
  institutionId: string;
  institutionName: string;
};

export function InstitutionReactivateButton({ institutionId, institutionName }: InstitutionReactivateButtonProps): ReactElement {
  const [isPending, startTransition] = useTransition();

  function reactivateInstitution(): void {
    startTransition(async () => {
      const result = await safelyRunAction(updateInstitutionStatusAction(institutionId, true), INSTITUTION_ERROR_MESSAGES.UPDATE_STATUS(true));

      if (result.error) {
        toast.error(result.error);

        return;
      }

      toast.success(`${institutionName} fue reactivada.`);
    });
  }

  return (
    <Button type="button" size="lg" onClick={reactivateInstitution} disabled={isPending}>
      {isPending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <RotateCcwIcon data-icon="inline-start" />}
      Reactivar institución
    </Button>
  );
}
