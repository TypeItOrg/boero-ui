"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { PersonDeleteDialog } from "@features/people/components/person-delete-dialog";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PersonDeleteButtonProps = {
  institutionId: string;
  personId: string;
  personName: string;
  scope?: PeopleScopeType;
  label?: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

export function PersonDeleteButton({
  institutionId,
  personId,
  personName,
  scope = PeopleScope.ADMIN,
  label = "Eliminar",
  size,
}: PersonDeleteButtonProps): React.ReactElement {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  function handleDeleted(): void {
    router.push(PeopleScope.isInstitutional(scope) ? "/people" : `/admin/institutions/${institutionId}/people`);
  }

  const resolvedSize = size ?? (PeopleScope.isInstitutional(scope) ? "lg" : "default");

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
        <Button type="button" variant="destructive" size={resolvedSize}>
          {label}
        </Button>
      }
    />
  );
}
