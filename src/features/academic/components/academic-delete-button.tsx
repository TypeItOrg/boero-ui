"use client";

import { useState } from "react";

import { Button } from "@common/components/ui/button";
import { AcademicDeleteDialog } from "@features/academic/components/academic-delete-dialog";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicDeleteButtonProps = {
  scope: AcademicScope;
  institutionId: string;
  resource: AcademicResource.ACADEMIC_LEVEL | AcademicResource.STUDY_PLAN_SPACE | AcademicResource.PREREQUISITE;
  id: string;
  destination: string;
  label: string;
  size?: React.ComponentProps<typeof Button>["size"];
};

export function AcademicDeleteButton(props: AcademicDeleteButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" size={props.size} onClick={() => setOpen(true)}>
        Eliminar
      </Button>
      {open ? <AcademicDeleteDialog {...props} open onOpenChange={setOpen} /> : null}
    </>
  );
}
