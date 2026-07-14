"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@common/components/ui/button";
import { deletePersonAction } from "../actions/delete-person.action";

type PersonDeleteButtonProps = {
  institutionId: string;
  personId: string;
};

export function PersonDeleteButton({ institutionId, personId }: PersonDeleteButtonProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  function handleDelete(): void {
    const confirmed = window.confirm("¿Eliminar este usuario de la institución?");
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deletePersonAction(institutionId, personId);

      if (result.error) {
        toast.error(result.error);
      }

      if (result.success) {
        toast.success("Usuario eliminado correctamente.");
        router.push(`/platform/institutions/${institutionId}/people`);
      }
    });
  }

  return (
    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
      <TrashIcon data-icon="inline-start" />
      {isPending ? "Eliminando..." : "Eliminar usuario"}
    </Button>
  );
}
