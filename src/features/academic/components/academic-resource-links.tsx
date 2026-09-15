import { NavigationCard } from "@common/components/navigation/navigation-card";
import { cn } from "@common/utils/cn.util";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { ACADEMIC_COLLECTION_RESOURCES, type AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

type AcademicResourceLinksProps = {
  basePath: string;
  className?: string;
  leadingContent?: React.ReactNode;
  prominent?: boolean;
  resources: readonly AcademicCollectionResource[];
};

const ACADEMIC_RESOURCE_DESCRIPTIONS: Record<AcademicCollectionResource, string> = {
  [AcademicResource.ACADEMIC_YEAR]: "Organizá los períodos y fechas del calendario académico.",
  [AcademicResource.TRAINING_PATH]: "Definí las propuestas formativas de la institución.",
  [AcademicResource.STUDY_PLAN]: "Administrá la estructura curricular de cada trayecto.",
  [AcademicResource.ACADEMIC_SPACE]: "Gestioná las materias y espacios de formación.",
  [AcademicResource.INSTRUMENT]: "Administrá los instrumentos disponibles en la institución.",
  [AcademicResource.COURSE]: "Creá instancias de espacios académicos por ciclo lectivo.",
  [AcademicResource.SHIFT]: "Organizá los turnos disponibles para la oferta académica.",
};

export function getReadableAcademicResources(access: AcademicAccess): AcademicCollectionResource[] {
  return ACADEMIC_COLLECTION_RESOURCES.filter((resource) => ACADEMIC_COLLECTION_CONFIG[resource].canRead(access));
}

export function AcademicResourceLinks({
  basePath,
  className,
  leadingContent,
  prominent = false,
  resources,
}: AcademicResourceLinksProps): React.ReactElement {
  const itemCount = resources.length + (leadingContent ? 1 : 0);

  return (
    <nav aria-label="Secciones académicas" className={cn(prominent ? "grid gap-4 @2xl/home-content:grid-cols-2" : "grid gap-3", className)}>
      {leadingContent}
      {resources.map((resource, index) => {
        const config = ACADEMIC_COLLECTION_CONFIG[resource];
        const icon = ACADEMIC_RESOURCE_ICONS[resource];
        const isLastOddResource = itemCount % 2 === 1 && index === resources.length - 1;

        return (
          <NavigationCard
            key={resource}
            href={`${basePath}/${resource}`}
            icon={icon}
            title={config.title}
            description={prominent ? ACADEMIC_RESOURCE_DESCRIPTIONS[resource] : undefined}
            prominent={prominent}
            className={prominent && isLastOddResource ? "@2xl/home-content:col-span-2" : undefined}
          />
        );
      })}
    </nav>
  );
}
