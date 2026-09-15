"use client";

import * as React from "react";
import { BookMarkedIcon, CheckIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldError, FieldGroup } from "@common/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { cn } from "@common/utils/cn.util";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import { approvalModeLabels, requirementTypeLabels } from "@features/academic/utils/academic-labels.util";

interface EnrollmentStudyPlanSpacesSelectorProps {
  studyPlanSpaces: readonly StudyPlanSpace[];
  selectedStudyPlanSpaceIds: readonly string[];
  selectedInstrumentIdsByStudyPlanSpaceId: Record<string, string>;
  onToggleSpace: (studyPlanSpaceId: string) => void;
  onSelectInstrument: (studyPlanSpaceId: string, instrumentId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  spaceError?: string;
  instrumentError?: string;
}

export function EnrollmentStudyPlanSpacesSelector({
  studyPlanSpaces,
  selectedStudyPlanSpaceIds,
  selectedInstrumentIdsByStudyPlanSpaceId,
  onToggleSpace,
  onSelectInstrument,
  disabled = false,
  isLoading = false,
  spaceError,
  instrumentError,
}: EnrollmentStudyPlanSpacesSelectorProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 p-12 text-center">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-sm">Cargando espacios académicos disponibles…</p>
      </div>
    );
  }

  if (studyPlanSpaces.length === 0) {
    return (
      <Card className="bg-background border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarkedIcon className="text-muted-foreground size-5" aria-hidden="true" />
            <CardTitle>No hay espacios curriculares disponibles</CardTitle>
          </div>
          <CardDescription>El plan o trayecto seleccionado todavía no tiene espacios habilitados para esta inscripción.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <FieldGroup role="group" aria-label="Espacios académicos disponibles" className="bg-background gap-0 overflow-hidden rounded-xl border">
        {studyPlanSpaces.map((space) => {
          const isSelected = selectedStudyPlanSpaceIds.includes(space.id);
          const selectedInstrumentId = selectedInstrumentIdsByStudyPlanSpaceId[space.id] || "";
          const hasMissingInstrument = isSelected && space.requiresInstrument && !selectedInstrumentId;
          const metadata = [
            space.academicLevelName,
            requirementTypeLabels[space.requirementType],
            approvalModeLabels[space.approvalMode],
            space.requiresInstrument ? "Requiere instrumento" : null,
          ].filter(Boolean);

          return (
            <div key={space.id} className={cn("border-b last:border-b-0", isSelected && "bg-primary/5", hasMissingInstrument && "bg-destructive/5")}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onToggleSpace(space.id)}
                className="hover:bg-muted/50 focus-visible:ring-ring flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "border-muted-foreground/30 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isSelected ? <CheckIcon className="size-3.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{space.academicSpaceName}</span>
                  <span className="text-muted-foreground mt-0.5 block text-sm">{metadata.join(" · ")}</span>
                </span>
              </button>

              {isSelected && space.requiresInstrument ? (
                <div className="bg-muted/25 border-t px-4 py-3">
                  <label htmlFor={`instrument-select-${space.id}`} className="text-sm font-medium">
                    Instrumento
                  </label>
                  <Select disabled={disabled} value={selectedInstrumentId} onValueChange={(value) => onSelectInstrument(space.id, value)}>
                    <SelectTrigger
                      id={`instrument-select-${space.id}`}
                      className={cn("mt-2 w-full", hasMissingInstrument && "border-destructive")}
                      aria-label={`Instrumento para ${space.academicSpaceName}`}
                    >
                      <SelectValue placeholder="Seleccioná un instrumento" />
                    </SelectTrigger>
                    <SelectContent>
                      {space.allowedInstruments.length > 0 ? (
                        space.allowedInstruments.map((instrument) => (
                          <SelectItem key={instrument.instrumentId} value={instrument.instrumentId}>
                            {instrument.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No hay instrumentos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {hasMissingInstrument ? <p className="text-destructive mt-2 text-xs">Seleccioná un instrumento para este espacio.</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </FieldGroup>
      {spaceError ? <FieldError errors={[{ message: spaceError }]} /> : null}
      {instrumentError ? <FieldError errors={[{ message: instrumentError }]} /> : null}
    </div>
  );
}
