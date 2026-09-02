"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, Loader2Icon, RouteIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldError, FieldGroup } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
import { saveEnrollmentApplicationTrainingPathAction } from "@features/enrollment/actions/save-enrollment-application-training-path.action";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationDraftData } from "@features/enrollment/types/enrollment-application-draft-data.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";

type EnrollmentTrainingPathFormProps = {
  applicationId: string;
  applicationEditable: boolean;
  currentData: EnrollmentApplicationDraftData;
  trainingPaths: readonly TrainingPath[];
  returnTo: string;
  academicYearLabel: string;
  studyPlanName: string;
};

const INITIAL_STATE: EnrollmentApplicationActionState = {};

export function EnrollmentTrainingPathForm({
  applicationId,
  applicationEditable,
  currentData,
  trainingPaths,
  returnTo,
  academicYearLabel,
  studyPlanName,
}: EnrollmentTrainingPathFormProps): React.ReactElement {
  const action = saveEnrollmentApplicationTrainingPathAction.bind(null, applicationId);
  const [state, formAction, isPending] = React.useActionState(action, INITIAL_STATE);
  const [selectedTrainingPathId, setSelectedTrainingPathId] = React.useState(currentData.careerSelection?.trainingPathId ?? "");
  const [dataSnapshot, setDataSnapshot] = React.useState(currentData);

  React.useEffect(() => {
    if (!state.success || !selectedTrainingPathId) return;
    setDataSnapshot((previous) => buildNextDraftData(previous, selectedTrainingPathId));
  }, [selectedTrainingPathId, state.success]);

  const fieldErrors = state.fieldErrors?.trainingPathId ? [{ message: state.fieldErrors.trainingPathId }] : undefined;
  const canSubmit = applicationEditable && selectedTrainingPathId.length > 0 && !isPending;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="currentData" value={JSON.stringify(dataSnapshot)} />
      <input type="hidden" name="trainingPathId" value={selectedTrainingPathId} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <div className="space-y-4">
          {state.error ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>No se pudo guardar la selección</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          {state.success ? (
            <Alert>
              <CheckCircle2Icon className="size-4" />
              <AlertTitle>Trayecto guardado</AlertTitle>
              <AlertDescription>La selección quedó asociada al borrador de tu solicitud.</AlertDescription>
            </Alert>
          ) : null}

          {!applicationEditable ? (
            <Alert>
              <AlertCircleIcon className="size-4" />
              <AlertTitle>Solicitud no editable</AlertTitle>
              <AlertDescription>Esta solicitud ya no admite cambios, por lo que no podés modificar su trayecto formativo.</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup role="radiogroup" aria-label="Trayectos formativos disponibles">
            {trainingPaths.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>No hay trayectos disponibles</CardTitle>
                  <CardDescription>La institución todavía no tiene trayectos habilitados para esta solicitud.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              trainingPaths.map((trainingPath) => {
                const checked = trainingPath.id === selectedTrainingPathId;
                return (
                  <button
                    key={trainingPath.id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    disabled={!applicationEditable || isPending}
                    onClick={() => setSelectedTrainingPathId(trainingPath.id)}
                    className={cn("text-left transition-transform disabled:cursor-not-allowed disabled:opacity-60", checked && "translate-y-px")}
                  >
                    <Card
                      className={cn(
                        "border-border hover:border-primary/40 hover:bg-primary/3 min-h-40 border",
                        checked && "border-primary bg-primary/5 ring-primary/15 ring-3",
                      )}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle>{trainingPath.name}</CardTitle>
                            <CardDescription>{trainingPath.description ?? "Trayecto sin descripción institucional."}</CardDescription>
                          </div>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "border-muted-foreground/30 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
                              checked && "border-primary bg-primary text-primary-foreground",
                            )}
                          >
                            {checked ? <CheckCircle2Icon className="size-4" /> : null}
                          </span>
                        </div>
                      </CardHeader>
                      <CardFooter className="text-muted-foreground justify-between text-xs sm:text-sm">
                        <span>{trainingPath.active ? "Habilitado para inscripción" : "No habilitado"}</span>
                        <span>{checked ? "Seleccionado" : "Seleccionar"}</span>
                      </CardFooter>
                    </Card>
                  </button>
                );
              })
            )}
            <FieldError errors={fieldErrors} />
          </FieldGroup>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contexto de la solicitud</CardTitle>
              <CardDescription>Tu selección de trayecto queda guardada dentro de este borrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContextRow label="Plan de estudio" value={studyPlanName} />
              <ContextRow label="Ciclo lectivo" value={academicYearLabel} />
              <ContextRow label="Estado" value={applicationEditable ? "Editable" : "Bloqueado"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Antes de continuar</CardTitle>
              <CardDescription>Elegí un único trayecto para definir la propuesta académica de esta inscripción.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>La selección se guarda en el borrador actual.</p>
              <p>Si cambiás de trayecto más adelante, esta pantalla reflejará la última opción guardada.</p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild type="button" size="lg" variant="outline">
          <Link href={returnTo}>Volver</Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {selectedTrainingPathId.length > 0 ? (
            <Button asChild type="button" size="lg" variant="secondary">
              <Link
                href={`/enrollment-applications/${applicationId}/study-plan-spaces?returnTo=${encodeURIComponent(`/enrollment-applications/${applicationId}/training-path`)}`}
              >
                Ver espacios academicos
              </Link>
            </Button>
          ) : null}
          <Button type="submit" size="lg" disabled={!canSubmit} aria-busy={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
                Guardando…
              </>
            ) : (
              <>
                <RouteIcon data-icon="inline-start" />
                Guardar trayecto
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function ContextRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-1 rounded-lg border px-3 py-2">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function buildNextDraftData(currentData: EnrollmentApplicationDraftData, trainingPathId: string): EnrollmentApplicationDraftData {
  return {
    ...currentData,
    careerSelection: {
      ...(currentData.careerSelection ?? {}),
      trainingPathId,
    },
  };
}
