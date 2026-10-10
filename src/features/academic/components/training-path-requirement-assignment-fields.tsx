"use client";

import type { ReactElement } from "react";

import { Input } from "@common/components/ui/input";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";

export function TrainingPathRequirementAssignmentFields({
  initial,
  pending,
}: {
  initial: TrainingPathDocumentDraft | undefined;
  pending: boolean;
}): ReactElement {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
      <FormField name="requirement-active" label="Asignación">
        <FormSelect
          name="active"
          id="requirement-active"
          defaultValue={String(initial?.active ?? true)}
          options={[
            { value: "true", label: "Activa" },
            { value: "false", label: "Inactiva" },
          ]}
          disabled={pending}
        />
      </FormField>
      <FormField name="requirement-order" label="Orden" required>
        <Input
          id="requirement-order"
          name="displayOrder"
          type="number"
          min={0}
          max={2147483647}
          defaultValue={initial?.displayOrder ?? 0}
          required
          disabled={pending}
        />
      </FormField>
    </div>
  );
}
