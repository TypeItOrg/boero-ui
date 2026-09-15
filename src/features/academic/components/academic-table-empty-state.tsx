import * as React from "react";
import { GraduationCapIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

type AcademicTableEmptyStateProps = {
  createAction: React.ReactNode;
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage: () => void;
  showingDeleted: boolean;
  supportingDescription?: string;
};

export function AcademicTableEmptyState({
  createAction,
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
  showingDeleted,
  supportingDescription,
}: AcademicTableEmptyStateProps): React.ReactElement {
  const Icon = hasFilters ? SearchIcon : GraduationCapIcon;
  const copy = getEmptyStateCopy(hasFilters, hasItemsOnOtherPages, showingDeleted);
  const description = supportingDescription ?? copy.description;

  return (
    <Empty className="bg-muted/25 h-full min-h-80 rounded-lg border border-solid px-4 py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <Icon className="size-5" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{copy.title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {createAction}
      {hasItemsOnOtherPages ? (
        <Button type="button" variant="outline" size="sm" className="mt-6" onClick={onFirstPage}>
          Volver a la primera página
        </Button>
      ) : null}
    </Empty>
  );
}

function getEmptyStateCopy(hasFilters: boolean, hasItemsOnOtherPages: boolean, showingDeleted: boolean): { title: string; description: string } {
  if (hasItemsOnOtherPages) {
    return {
      title: "No hay elementos en esta página",
      description: "Volvé a la primera página para ver los resultados.",
    };
  }
  if (hasFilters) {
    if (showingDeleted) {
      return {
        title: "No hay registros eliminados",
        description: "No hay registros eliminados para mostrar. Esta vista separa los registros eliminados de los vigentes.",
      };
    }
    return {
      title: "No se encontraron resultados",
      description: "No encontramos elementos que coincidan con los filtros.",
    };
  }
  return {
    title: "No hay registros académicos",
    description: "Todavía no se registraron elementos en esta sección.",
  };
}

export function getEmptyStateSupportingDescription(resource: AcademicCollectionResource, singular: string): string {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR:
      return "Creá un ciclo lectivo para definir el calendario y organizar las fechas académicas de la institución.";
    case AcademicResource.TRAINING_PATH:
      return "Creá un trayecto formativo para organizar carreras, orientaciones y recorridos académicos.";
    case AcademicResource.STUDY_PLAN:
      return "Creá tu primer plan de estudio para organizar la estructura curricular, definir su vigencia y asociarlo a un trayecto formativo.";
    case AcademicResource.ACADEMIC_SPACE:
      return "Creá un espacio académico para construir el catálogo de asignaturas, talleres y seminarios.";
    case AcademicResource.INSTRUMENT:
      return "Agregá instrumentos al catálogo institucional para mantenerlos disponibles en tus propuestas académicas.";
    default:
      return `Creá tu primer ${singular} para comenzar a organizar la información académica.`;
  }
}
