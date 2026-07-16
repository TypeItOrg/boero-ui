"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PersonDeleteDialog } from "./person-delete-dialog";

type PersonDeleteButtonProps = {
  institutionId: string;
  personId: string;
  personName: string;
};

export function PersonDeleteButton({
  institutionId,
  personId,
  personName,
}: PersonDeleteButtonProps): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  function handleDeleted(): void {
    router.push(`/admin/institutions/${institutionId}/people`);
  }

  return (
    <PersonDeleteDialog
      institutionId={institutionId}
      personId={personId}
      personName={personName}
      open={open}
      onOpenChange={setOpen}
      onDeleted={handleDeleted}
      trigger={
        <Button type="button" variant="destructive">
          <TrashIcon data-icon="inline-start" />
          Eliminar usuario
        </Button>
      }
    />
  );
}
