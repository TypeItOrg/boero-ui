import { NavigationCard } from "@common/components/navigation/navigation-card";
import { cn } from "@common/utils/cn.util";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_RESOURCE_ICONS } from "@features/academic/config/academic-resource-icons.config";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import { ACADEMIC_COLLECTION_RESOURCES, type AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";

type AcademicResourceLinksProps = {
  basePath: string;
  className?: string;
  prominent?: boolean;
  resources: readonly AcademicCollectionResource[];
};

export function getReadableAcademicResources(access: AcademicAccess): AcademicCollectionResource[] {
  return ACADEMIC_COLLECTION_RESOURCES.filter((resource) => ACADEMIC_COLLECTION_CONFIG[resource].canRead(access));
}

export function AcademicResourceLinks({ basePath, className, prominent = false, resources }: AcademicResourceLinksProps): React.ReactElement {
  return (
    <nav aria-label="Secciones académicas" className={cn(prominent ? "grid gap-4 sm:grid-cols-2" : "grid gap-3", className)}>
      {resources.map((resource, index) => {
        const config = ACADEMIC_COLLECTION_CONFIG[resource];
        const icon = ACADEMIC_RESOURCE_ICONS[resource];
        const isLastOddResource = resources.length % 2 === 1 && index === resources.length - 1;

        return (
          <NavigationCard
            key={resource}
            href={`${basePath}/${resource}`}
            icon={icon}
            title={config.title}
            prominent={prominent}
            className={prominent && isLastOddResource ? "sm:col-span-2" : undefined}
          />
        );
      })}
    </nav>
  );
}
