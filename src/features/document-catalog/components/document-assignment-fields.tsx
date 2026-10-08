"use client";

import type { ReactElement } from "react";

import { Trash2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";

export function AssignmentFields({
  item,
  onChange,
  onRemove,
  disabled,
}: {
  item: DocumentAssignment;
  onChange: (item: DocumentAssignment) => void;
  onRemove: () => void;
  disabled: boolean;
}): ReactElement {
  return (
    <fieldset disabled={disabled} aria-labelledby={`assignment-title-${item.trainingPathId}`} className="min-w-0 space-y-4">
      <div className="bg-muted/70 -mx-4 flex items-center justify-between gap-3 border-y px-4 py-1.5 sm:-mx-6 sm:px-6">
        <h3 id={`assignment-title-${item.trainingPathId}`} className="min-w-0 py-0.5 text-sm font-semibold break-words">
          {item.trainingPathName ?? "Trayecto seleccionado"}
        </h3>
        <Button
          type="button"
          size="icon-lg"
          variant="destructive"
          className="shrink-0"
          aria-label={`Quitar ${item.trainingPathName ?? "trayecto"} de las asignaciones`}
          title="Quitar trayecto"
          onClick={onRemove}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField name={`level-${item.trainingPathId}`} label="Exigencia">
          <FormSelect
            name={`level-${item.trainingPathId}`}
            disabled={disabled}
            value={item.level}
            onValueChange={(value) => onChange({ ...item, level: value as DocumentAssignment["level"] })}
            options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </FormField>
        <FormField name={`order-${item.trainingPathId}`} label="Orden" required>
          <Input
            id={`order-${item.trainingPathId}`}
            disabled={disabled}
            type="number"
            required
            min={0}
            max={2147483647}
            value={item.displayOrder}
            onChange={(event) => onChange({ ...item, displayOrder: event.currentTarget.valueAsNumber })}
          />
        </FormField>
      </div>
      <FormField name={`instructions-${item.trainingPathId}`} label="Instrucciones específicas">
        <Textarea
          id={`instructions-${item.trainingPathId}`}
          disabled={disabled}
          value={item.specificInstructions ?? ""}
          maxLength={1000}
          onChange={(event) => onChange({ ...item, specificInstructions: event.currentTarget.value })}
        />
      </FormField>
    </fieldset>
  );
}
