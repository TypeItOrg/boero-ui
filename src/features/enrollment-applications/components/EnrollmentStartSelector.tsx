"use client";
import * as React from "react";
import { CheckIcon, ClipboardPlusIcon, Loader2Icon, RouteIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { cn } from "@common/utils/cn.util";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";

export interface EnrollmentStartStudyPlanOption {
  id: string;
  name: string;
  trainingPathName: string;
}
export interface EnrollmentStartPeriodOption {
  id: string;
  academicYearId: string;
  academicYearNumber: number;
  name: string;
}
interface Props {
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods?: EnrollmentStartPeriodOption[];
  onStart: (selection: StartEnrollmentApplicationInput) => void;
  error?: string;
  isStarting?: boolean;
  studyPlanPagination?: React.ReactNode;
}
export function formatEnrollmentStartOptionLabel(option: Pick<EnrollmentStartStudyPlanOption, "name" | "trainingPathName">): string {
  return !option.trainingPathName || option.trainingPathName === option.name ? option.name : `${option.name} — ${option.trainingPathName}`;
}

export function EnrollmentStartSelector({ studyPlans, onStart, error, isStarting = false, studyPlanPagination }: Props): React.ReactElement {
  const [selectedId, setSelectedId] = React.useState(studyPlans[0]?.id ?? "");
  const trainingPathId = studyPlans.some((path) => path.id === selectedId) ? selectedId : (studyPlans[0]?.id ?? "");

  return (
    <Card className="bg-muted/25">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3.5">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <ClipboardPlusIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 className="font-heading text-base leading-snug font-semibold text-balance">Iniciar solicitud de inscripción</h2>
            <CardDescription className="mt-1 text-pretty">
              Elegí el trayecto formativo al que querés inscribirte. Luego vas a poder consultar los cursos disponibles.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo iniciar la inscripción</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {studyPlans.length > 0 ? (
          <fieldset className="grid gap-4">
            <legend className="sr-only">Trayectos formativos disponibles</legend>
            <div className="bg-background divide-y overflow-hidden rounded-lg border">
              {studyPlans.map((plan) => {
                const checked = plan.id === trainingPathId;

                return (
                  <label key={plan.id} className={isStarting ? "block cursor-not-allowed" : "block cursor-pointer"}>
                    <input
                      className="peer sr-only"
                      type="radio"
                      name="trainingPathId"
                      value={plan.id}
                      checked={checked}
                      disabled={isStarting}
                      onChange={() => setSelectedId(plan.id)}
                    />
                    <span
                      className={cn(
                        "peer-focus-visible:ring-ring/50 flex min-h-13 items-center gap-3 px-4 py-3 text-left peer-focus-visible:ring-3 peer-focus-visible:ring-inset",
                        checked && "bg-muted/60",
                        isStarting && "opacity-60",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "border-muted-foreground/30 flex size-5 shrink-0 items-center justify-center rounded-full border",
                          checked && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {checked ? <CheckIcon className="size-3.5" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-medium text-pretty">{formatEnrollmentStartOptionLabel(plan)}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {studyPlanPagination}
          </fieldset>
        ) : (
          <Empty className="bg-background min-h-56 rounded-xl border border-solid p-6">
            <EmptyHeader className="max-w-md">
              <EmptyMedia variant="icon">
                <RouteIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="mt-2 text-base">No hay trayectos disponibles</EmptyTitle>
              <EmptyDescription>No hay trayectos con cursos disponibles para inscribirse en esta página.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          className="w-full sm:w-auto"
          type="button"
          size="lg"
          disabled={isStarting || !trainingPathId}
          onClick={() => onStart({ trainingPathId })}
        >
          {isStarting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Iniciando…
            </>
          ) : (
            "Comenzar inscripción"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
