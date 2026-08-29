"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircleIcon, BookMarkedIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { FieldError, FieldGroup } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
import { saveEnrollmentApplicationStudyPlanSpacesAction } from "@features/enrollment/actions/save-enrollment-application-study-plan-spaces.action";
import type { EnrollmentApplicationActionState } from "@features/enrollment/types/enrollment-application-action-state.types";
import type { EnrollmentApplicationDraftData } from "@features/enrollment/types/enrollment-application-draft-data.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";

type EnrollmentStudyPlanSpacesFormProps = {
  applicationId: string;
  applicationEditable: boolean;
  currentData: EnrollmentApplicationDraftData;
  studyPlanSpaces: readonly StudyPlanSpace[];
  returnTo: string;
  academicYearLabel: string;
  studyPlanName: string;
};

const INITIAL_STATE: EnrollmentApplicationActionState = {};

export function EnrollmentStudyPlanSpacesForm({
  applicationId,
  applicationEditable,
  currentData,
  studyPlanSpaces,
  returnTo,
  academicYearLabel,
  studyPlanName,
}: EnrollmentStudyPlanSpacesFormProps): React.ReactElement {
  const action = saveEnrollmentApplicationStudyPlanSpacesAction.bind(null, applicationId);
  const [state, formAction, isPending] = React.useActionState(action, INITIAL_STATE);
  const [selectedStudyPlanSpaceIds, setSelectedStudyPlanSpaceIds] = React.useState<string[]>(
    () => currentData.academicSpaceSelection?.studyPlanSpaceIds ?? [],
  );
  const [dataSnapshot, setDataSnapshot] = React.useState(currentData);

  React.useEffect(() => {
    if (!state.success) return;
    setDataSnapshot((previous) => buildNextDraftData(previous, selectedStudyPlanSpaceIds));
  }, [selectedStudyPlanSpaceIds, state.success]);

  const fieldErrors = state.fieldErrors?.studyPlanSpaceIds ? [{ message: state.fieldErrors.studyPlanSpaceIds }] : undefined;
  const canSubmit = applicationEditable && !isPending;

  function toggleStudyPlanSpace(studyPlanSpaceId: string): void {
    setSelectedStudyPlanSpaceIds((previous) =>
      previous.includes(studyPlanSpaceId) ? previous.filter((id) => id !== studyPlanSpaceId) : [...previous, studyPlanSpaceId],
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="currentData" value={JSON.stringify(dataSnapshot)} />
      {selectedStudyPlanSpaceIds.map((studyPlanSpaceId) => (
        <input key={studyPlanSpaceId} type="hidden" name="studyPlanSpaceIds" value={studyPlanSpaceId} />
      ))}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        <div className="space-y-4">
          {state.error ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertTitle>No se pudo guardar la seleccion</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          {state.success ? (
            <Alert>
              <CheckCircle2Icon className="size-4" />
              <AlertTitle>Espacios guardados</AlertTitle>
              <AlertDescription>La seleccion quedo asociada al borrador de tu solicitud.</AlertDescription>
            </Alert>
          ) : null}

          {!applicationEditable ? (
            <Alert>
              <AlertCircleIcon className="size-4" />
              <AlertTitle>Solicitud no editable</AlertTitle>
              <AlertDescription>Esta solicitud ya no admite cambios, por lo que no podes modificar sus espacios academicos.</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup role="group" aria-label="Espacios academicos disponibles">
            {studyPlanSpaces.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>No hay espacios disponibles</CardTitle>
                  <CardDescription>El plan de estudio no tiene espacios habilitados para esta solicitud.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              studyPlanSpaces.map((studyPlanSpace) => {
                const checked = selectedStudyPlanSpaceIds.includes(studyPlanSpace.id);
                return (
                  <button
                    key={studyPlanSpace.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={!applicationEditable || isPending}
                    onClick={() => toggleStudyPlanSpace(studyPlanSpace.id)}
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
                            <CardTitle>{studyPlanSpace.academicSpaceName}</CardTitle>
                            <CardDescription>{studyPlanSpace.academicLevelName ?? "Sin nivel academico asociado."}</CardDescription>
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
                      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                        <InfoPill label="Modalidad de aprobacion" value={studyPlanSpace.approvalMode} />
                        <InfoPill label="Requisito" value={studyPlanSpace.requirementType} />
                      </CardContent>
                      <CardFooter className="text-muted-foreground justify-between text-xs sm:text-sm">
                        <span>{checked ? "Seleccionado" : "Disponible para seleccionar"}</span>
                        <span>Orden #{studyPlanSpace.displayOrder}</span>
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
              <CardDescription>Tu seleccion de espacios queda guardada dentro de este borrador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ContextRow label="Plan de estudio" value={studyPlanName} />
              <ContextRow label="Ciclo lectivo" value={academicYearLabel} />
              <ContextRow label="Estado" value={applicationEditable ? "Editable" : "Bloqueado"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seleccion actual</CardTitle>
              <CardDescription>Podes guardar una seleccion parcial y volver a editarla mientras la solicitud siga abierta.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              <p>
                {selectedStudyPlanSpaceIds.length === 0
                  ? "Todavia no seleccionaste espacios academicos."
                  : `${selectedStudyPlanSpaceIds.length} espacio(s) seleccionado(s).`}
              </p>
              <p>La validacion final para continuar al siguiente paso se definira cuando exista esa pantalla.</p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button asChild type="button" size="lg" variant="outline">
          <Link href={returnTo}>Volver</Link>
        </Button>
        <Button type="submit" size="lg" disabled={!canSubmit} aria-busy={isPending}>
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
              Guardando...
            </>
          ) : (
            <>
              <BookMarkedIcon data-icon="inline-start" />
              Guardar seleccion
            </>
          )}
        </Button>
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

function InfoPill({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="bg-muted/40 rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function buildNextDraftData(currentData: EnrollmentApplicationDraftData, studyPlanSpaceIds: string[]): EnrollmentApplicationDraftData {
  return {
    ...currentData,
    academicSpaceSelection: {
      ...(currentData.academicSpaceSelection ?? {}),
      studyPlanSpaceIds,
    },
  };
}
