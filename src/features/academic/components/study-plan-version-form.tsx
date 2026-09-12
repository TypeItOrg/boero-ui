"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DateRangeFields } from "@features/academic/components/academic-date-range-fields";
import { NameField } from "@features/academic/components/academic-form-controls";
import { createStudyPlanVersionAction } from "@features/academic/actions/academic-resource.action";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type StudyPlanVersionFormProps = {
  institutionId: string;
  returnTo: string;
  scope: AcademicScope;
  source: StudyPlan;
};

const INITIAL_STATE: AcademicActionState = {};

export function StudyPlanVersionForm({ institutionId, returnTo, scope, source }: StudyPlanVersionFormProps): React.ReactElement {
  const action = createStudyPlanVersionAction.bind(null, scope, institutionId, source.id, returnTo);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const initialValues = {
    name: source.name,
    effectiveFrom: "",
    effectiveTo: "",
  };
  const hasFieldErrors = Object.keys(state.fieldErrors ?? {}).length > 0;

  return (
    <form action={formAction} noValidate className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {state.error && !hasFieldErrors ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo crear la versión</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
          <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
            <h2 className="text-base font-semibold">Datos de la nueva versión</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              La currícula del plan actual se copiará y quedará disponible para ajustar antes de publicarla.
            </p>
          </header>
          <div className="mt-5 flex flex-wrap gap-4">
            <NameField initialValues={initialValues} error={state.fieldErrors?.name} />
            <DateRangeFields
              startLabel="Vigente desde"
              startName="effectiveFrom"
              endLabel="Vigente hasta"
              endName="effectiveTo"
              initialValues={initialValues}
              fieldErrors={state.fieldErrors}
            />
          </div>
        </section>
      </div>
      <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={pending}>
          {pending ? "Creando…" : "Crear versión"}
        </Button>
      </div>
    </form>
  );
}
