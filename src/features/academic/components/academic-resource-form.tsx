"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { saveAcademicResourceAction } from "@features/academic/actions/academic-resource.action";
import { AcademicFormFields } from "@features/academic/components/academic-form-fields";
import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import type { AcademicFormOptions } from "@features/academic/types/academic-form-options.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicResourceFormProps = AcademicFormOptions & {
  scope: AcademicScope;
  institutionId: string;
  resource: AcademicResource;
  id?: string;
  parentId?: string;
  returnTo: string;
};

const initialState: AcademicActionState = {};

const CREATE_ACTION_LABELS: Record<AcademicResource, string> = {
  [AcademicResource.ACADEMIC_YEAR]: "Crear ciclo lectivo",
  [AcademicResource.TRAINING_PATH]: "Crear trayecto formativo",
  [AcademicResource.STUDY_PLAN]: "Crear plan de estudio",
  [AcademicResource.ACADEMIC_LEVEL]: "Crear nivel",
  [AcademicResource.ACADEMIC_SPACE]: "Crear espacio académico",
  [AcademicResource.STUDY_PLAN_SPACE]: "Incorporar espacio",
  [AcademicResource.PREREQUISITE]: "Crear correlatividad",
  [AcademicResource.INSTRUMENT]: "Crear instrumento",
};

const FORM_SECTION_COPY: Record<AcademicResource, { title: string; description: string }> = {
  [AcademicResource.ACADEMIC_YEAR]: {
    title: "Datos del ciclo lectivo",
    description: "Definí el año y, si corresponde, su período de vigencia.",
  },
  [AcademicResource.TRAINING_PATH]: {
    title: "Datos del trayecto formativo",
    description: "Usá un nombre claro para identificar la carrera, orientación o recorrido.",
  },
  [AcademicResource.STUDY_PLAN]: {
    title: "Datos del plan de estudio",
    description: "Vinculá el plan con un trayecto y definí su período de vigencia.",
  },
  [AcademicResource.ACADEMIC_LEVEL]: {
    title: "Datos del nivel",
    description: "Indicá cómo se identifica y ordena dentro de la estructura curricular.",
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    title: "Datos del espacio académico",
    description: "Definí el nombre, el tipo y la descripción del espacio reutilizable.",
  },
  [AcademicResource.STUDY_PLAN_SPACE]: {
    title: "Configuración curricular",
    description: "Ubicá el espacio dentro del plan y establecé sus condiciones académicas.",
  },
  [AcademicResource.PREREQUISITE]: {
    title: "Condición de correlatividad",
    description: "Seleccioná el espacio requerido y la condición que debe cumplirse.",
  },
  [AcademicResource.INSTRUMENT]: {
    title: "Datos del instrumento",
    description: "Ingresá la información con la que se identificará en el catálogo institucional.",
  },
};

export function AcademicResourceForm({
  scope,
  institutionId,
  resource,
  id,
  parentId,
  returnTo,
  ...options
}: AcademicResourceFormProps): React.ReactElement {
  const action = saveAcademicResourceAction.bind(null, scope, institutionId, resource, id, parentId, returnTo);
  const [state, formAction, pending] = useActionState(action, initialState);
  const section = FORM_SECTION_COPY[resource];
  const submitLabel = id ? "Guardar cambios" : CREATE_ACTION_LABELS[resource];

  return (
    <form action={formAction} noValidate className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {state.error ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
          <div>
            <h2 className="text-base font-semibold">{section.title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{section.description}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <AcademicFormFields
              resource={resource}
              fieldErrors={state.fieldErrors}
              institutionId={institutionId}
              scope={scope}
              {...options}
            />
          </div>
        </section>
      </div>

      <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" className="flex-1 sm:flex-none" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
