"use client";

import * as React from "react";
import { CheckCircle2Icon, RouteIcon } from "lucide-react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldError, FieldGroup } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
import type { TrainingPath } from "@features/academic/types/training-path.types";

interface EnrollmentTrainingPathSelectorProps {
  trainingPaths: readonly TrainingPath[];
  selectedTrainingPathId: string;
  onSelectTrainingPath: (trainingPathId: string) => void;
  disabled?: boolean;
  error?: string;
}

export function EnrollmentTrainingPathSelector({
  trainingPaths,
  selectedTrainingPathId,
  onSelectTrainingPath,
  disabled = false,
  error,
}: EnrollmentTrainingPathSelectorProps): React.ReactElement {
  if (trainingPaths.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RouteIcon className="text-muted-foreground size-5" />
            <CardTitle>No hay trayectos formativos específicos</CardTitle>
          </div>
          <CardDescription>
            Este plan de estudio no requiere seleccionar un trayecto formativo adicional para la inscripción. Podés continuar al siguiente paso.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Seleccioná tu Trayecto Formativo</h3>
        <p className="text-muted-foreground text-sm">
          Elegí la orientación o trayecto formativo en el que deseás inscribirte dentro del plan de estudio.
        </p>
      </div>

      <FieldGroup role="radiogroup" aria-label="Trayectos formativos disponibles" className="grid gap-3 sm:grid-cols-2">
        {trainingPaths.map((trainingPath) => {
          const checked = trainingPath.id === selectedTrainingPathId;
          return (
            <button
              key={trainingPath.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onSelectTrainingPath(trainingPath.id)}
              className={cn(
                "group focus-visible:ring-ring relative rounded-xl text-left transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                checked && "translate-y-px",
              )}
            >
              <Card
                className={cn(
                  "border-border group-hover:border-primary/40 group-hover:bg-primary/5 h-full transition-colors",
                  checked && "border-primary bg-primary/5 ring-primary/20 ring-2",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base leading-snug font-semibold">{trainingPath.name}</CardTitle>
                      {trainingPath.description ? (
                        <CardDescription className="line-clamp-2 text-xs">{trainingPath.description}</CardDescription>
                      ) : null}
                    </div>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "border-muted-foreground/30 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                        checked && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {checked ? <CheckCircle2Icon className="size-3.5" /> : null}
                    </span>
                  </div>
                </CardHeader>
                <CardFooter className="text-muted-foreground justify-between pt-0 text-xs">
                  <span>{trainingPath.active ? "Habilitado" : "No habilitado"}</span>
                  <span className={cn(checked ? "text-primary font-medium" : "")}>{checked ? "Seleccionado" : "Seleccionar"}</span>
                </CardFooter>
              </Card>
            </button>
          );
        })}
      </FieldGroup>

      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </div>
  );
}
