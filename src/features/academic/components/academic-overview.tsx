import { LayoutDashboardIcon } from "lucide-react";

import { AcademicRecentItems } from "@features/academic/components/academic-recent-items";
import { AcademicResourceLinks, getReadableAcademicResources } from "@features/academic/components/academic-resource-links";
import { AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { fetchAcademicRecentItems } from "@features/academic/services/academic-recent.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicOverviewProps = {
  access: AcademicAccess;
  basePath: string;
  breadcrumb: React.ReactNode;
  institutionId: string;
  scope: AcademicScope;
};

const STRUCTURE_RESOURCES: readonly AcademicCollectionResource[] = [
  AcademicResource.ACADEMIC_YEAR,
  AcademicResource.TRAINING_PATH,
  AcademicResource.STUDY_PLAN,
];

const CATALOG_RESOURCES: readonly AcademicCollectionResource[] = [AcademicResource.ACADEMIC_SPACE, AcademicResource.INSTRUMENT];

export async function AcademicOverview({ access, basePath, breadcrumb, institutionId, scope }: AcademicOverviewProps): Promise<React.ReactElement> {
  const resources = getReadableAcademicResources(access);
  const structureResources = STRUCTURE_RESOURCES.filter((resource) => resources.includes(resource));
  const catalogResources = CATALOG_RESOURCES.filter((resource) => resources.includes(resource));
  const recentItems = await fetchAcademicRecentItems(scope, institutionId, access);

  return (
    <AcademicShell
      title="Resumen académico"
      description="Accedé a la estructura académica y a la actividad reciente de la institución."
      breadcrumb={breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={LayoutDashboardIcon} />}
    >
      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        {structureResources.length > 0 ? (
          <AcademicGroup title="Estructura académica" description="Ciclos, trayectos y planes que ordenan la propuesta formativa.">
            <AcademicResourceLinks basePath={basePath} resources={structureResources} />
          </AcademicGroup>
        ) : null}

        {catalogResources.length > 0 ? (
          <AcademicGroup title="Catálogos" description="Elementos reutilizables de la oferta institucional.">
            <AcademicResourceLinks basePath={basePath} resources={catalogResources} />
          </AcademicGroup>
        ) : null}
      </div>

      <AcademicRecentItems basePath={basePath} items={recentItems} />
    </AcademicShell>
  );
}

function AcademicGroup({ children, description, title }: { children: React.ReactNode; description: string; title: string }): React.ReactElement {
  return (
    <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
