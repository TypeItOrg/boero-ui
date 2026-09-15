"use client";

import * as React from "react";
import { CheckCircle2Icon, RouteIcon } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";
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
    <div className="space-y-3">
      <FieldGroup role="radiogroup" aria-label="Trayectos formativos disponibles" className="bg-background gap-0 overflow-hidden rounded-xl border">
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
                "group hover:bg-muted/50 focus-visible:ring-ring flex w-full items-center gap-3 border-b px-4 py-3.5 text-left transition-colors last:border-b-0 focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-60",
                checked && "bg-primary/5 hover:bg-primary/8",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "border-muted-foreground/30 inline-flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  checked && "border-primary bg-primary text-primary-foreground",
                )}
              >
                {checked ? <CheckCircle2Icon className="size-3.5" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{trainingPath.name}</span>
                {trainingPath.description ? <span className="text-muted-foreground mt-0.5 block text-sm">{trainingPath.description}</span> : null}
              </span>
            </button>
          );
        })}
      </FieldGroup>

      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </div>
  );
}
