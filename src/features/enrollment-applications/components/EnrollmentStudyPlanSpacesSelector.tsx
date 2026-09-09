"use client";

import * as React from "react";
import { BookMarkedIcon, CheckCircle2Icon, MusicIcon, AlertCircleIcon } from "lucide-react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldGroup } from "@common/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Badge } from "@common/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { cn } from "@common/utils/cn.util";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

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
      <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 p-12 text-center">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        <p className="text-sm">Cargando espacios académicos disponibles...</p>
      </div>
    );
  }

  if (studyPlanSpaces.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarkedIcon className="text-muted-foreground size-5" />
            <CardTitle>No hay espacios curriculares disponibles</CardTitle>
          </div>
          <CardDescription>
            El plan de estudio o trayecto seleccionado aún no cuenta con espacios curriculares habilitados para esta inscripción.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Seleccioná los Espacios Académicos</h3>
        <p className="text-muted-foreground text-sm">
          Marcá las materias en las que te vas a inscribir. Para las materias instrumentales, elegí tu instrumento.
        </p>
      </div>

      {spaceError ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Selección requerida</AlertTitle>
          <AlertDescription>{spaceError}</AlertDescription>
        </Alert>
      ) : null}

      {instrumentError ? (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Instrumento pendiente</AlertTitle>
          <AlertDescription>{instrumentError}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup role="group" aria-label="Espacios académicos disponibles" className="grid gap-3 sm:grid-cols-2">
        {studyPlanSpaces.map((space) => {
          const isSelected = selectedStudyPlanSpaceIds.includes(space.id);
          const selectedInstrumentId = selectedInstrumentIdsByStudyPlanSpaceId[space.id] || "";
          const hasMissingInstrument = isSelected && space.requiresInstrument && !selectedInstrumentId;

          return (
            <Card
              key={space.id}
              className={cn(
                "border-border flex flex-col justify-between transition-all",
                isSelected && "border-primary bg-primary/5 ring-primary/20 ring-2",
                hasMissingInstrument && "border-destructive/60",
              )}
            >
              <div>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  disabled={disabled}
                  onClick={() => onToggleSpace(space.id)}
                  className="focus-visible:ring-ring w-full rounded-t-xl p-5 pb-3 text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs">#{space.displayOrder}</span>
                        <CardTitle className="text-base leading-snug font-semibold">{space.academicSpaceName}</CardTitle>
                      </div>
                      {space.academicLevelName ? <CardDescription className="text-xs">{space.academicLevelName}</CardDescription> : null}
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "border-muted-foreground/30 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {isSelected ? <CheckCircle2Icon className="size-3.5" /> : null}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {space.approvalMode}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {space.requirementType}
                    </Badge>
                    {space.requiresInstrument ? (
                      <Badge variant="default" className="flex items-center gap-1 text-[11px] font-normal">
                        <MusicIcon className="size-3" />
                        Instrumental
                      </Badge>
                    ) : null}
                  </div>
                </button>

                {isSelected && space.requiresInstrument ? (
                  <div className="border-border/50 bg-background/50 border-t px-5 pt-1 pb-3">
                    <div className="space-y-1.5 pt-2">
                      <label htmlFor={`instrument-select-${space.id}`} className="text-foreground flex items-center gap-1.5 text-xs font-medium">
                        <MusicIcon className="text-primary size-3" />
                        Seleccioná un instrumento:
                      </label>
                      <Select disabled={disabled} value={selectedInstrumentId} onValueChange={(val) => onSelectInstrument(space.id, val)}>
                        <SelectTrigger
                          id={`instrument-select-${space.id}`}
                          className={cn("h-8 w-full text-xs", hasMissingInstrument && "border-destructive")}
                          aria-label={`Instrumento para ${space.academicSpaceName}`}
                        >
                          <SelectValue placeholder="Elegir instrumento..." />
                        </SelectTrigger>
                        <SelectContent>
                          {space.allowedInstruments && space.allowedInstruments.length > 0 ? (
                            space.allowedInstruments.map((inst) => (
                              <SelectItem key={inst.instrumentId} value={inst.instrumentId} className="text-xs">
                                {inst.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled className="text-xs">
                              Sin instrumentos asignados
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {hasMissingInstrument ? (
                        <p className="text-destructive text-[11px]">Debés elegir un instrumento para cursar este espacio.</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <CardFooter className="text-muted-foreground border-border/20 justify-between border-t p-5 pt-2 text-xs">
                <span>{isSelected ? "Seleccionado" : "Click para seleccionar"}</span>
                {space.requiresInstrument && isSelected && selectedInstrumentId ? (
                  <span className="text-primary font-medium">Instrumento asignado</span>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </FieldGroup>
    </div>
  );
}
