"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PersonDeleteDialog } from "@features/people/components/person-delete-dialog";
import type { PeopleScope } from "@features/people/utils/people-scope.util";

type PersonDeleteButtonProps = {
  institutionId: string;
  personId: string;
  personName: string;
  scope?: PeopleScope;
};

export function PersonDeleteButton({
  institutionId,
  personId,
  personName,
  scope = "admin",
}: PersonDeleteButtonProps): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  function handleDeleted(): void {
    router.push(scope === "institutional" ? "/people" : `/admin/institutions/${institutionId}/people`);
  }

  return (
    <PersonDeleteDialog
      institutionId={institutionId}
      personId={personId}
      personName={personName}
      open={open}
      onOpenChange={setOpen}
      onDeleted={handleDeleted}
      scope={scope}
      trigger={
        <Button type="button" variant="destructive" size={scope === "institutional" ? "lg" : "default"}>
          <TrashIcon data-icon="inline-start" />
          Eliminar usuario
        </Button>
      }
    />
  );
}
