import * as React from "react";
import { GraduationCapIcon, SearchIcon } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

type AcademicTableEmptyStateProps = {
  createAction: React.ReactNode;
  hasFilters: boolean;
  hasItemsOnOtherPages: boolean;
  onFirstPage: () => void;
  showingDeleted: boolean;
  plural?: string;
  supportingDescription?: string;
};

export function AcademicTableEmptyState({
  createAction,
  hasFilters,
  hasItemsOnOtherPages,
  onFirstPage,
  showingDeleted,
  plural = "registros académicos",
  supportingDescription,
}: AcademicTableEmptyStateProps): React.ReactElement {
  const Icon = hasFilters && !hasItemsOnOtherPages ? SearchIcon : GraduationCapIcon;
  const copy = getEmptyStateCopy(hasFilters, hasItemsOnOtherPages, showingDeleted, plural);
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
      <DataTableEmptyStateActions
        createAction={showingDeleted ? undefined : createAction}
        hasFilters={hasFilters}
        hasItemsOnOtherPages={hasItemsOnOtherPages}
        onFirstPage={onFirstPage}
      />
    </Empty>
  );
}

function getEmptyStateCopy(
  hasFilters: boolean,
  hasItemsOnOtherPages: boolean,
  showingDeleted: boolean,
  plural: string,
): { title: string; description: string } {
  if (hasItemsOnOtherPages) {
    return {
      title: `No hay ${plural} en esta página`,
      description: DATA_TABLE_EMPTY_MESSAGES.PAGE_DESCRIPTION,
    };
  }
  if (hasFilters) {
    return {
      title: `No se encontraron ${plural}`,
      description: DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION,
    };
  }

  if (showingDeleted) {
    return {
      title: `Sin ${plural} eliminados para mostrar`,
      description: "Los registros eliminados se muestran en esta vista, separados de los vigentes.",
    };
  }

  return {
    title: `Sin ${plural} para mostrar`,
    description: `Todavía no hay ${plural} para mostrar en esta sección.`,
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
