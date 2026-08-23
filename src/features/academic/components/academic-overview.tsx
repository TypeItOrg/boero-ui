import { LayoutDashboardIcon, LibraryBigIcon, NetworkIcon, type LucideIcon } from "lucide-react";

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
      breadcrumb={breadcrumb}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={LayoutDashboardIcon} />}
    >
      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        {structureResources.length > 0 ? (
          <AcademicGroup title="Estructura académica" description="Organizá ciclos lectivos, trayectos y planes de estudio." icon={NetworkIcon}>
            <AcademicResourceLinks basePath={basePath} resources={structureResources} />
          </AcademicGroup>
        ) : null}

        {catalogResources.length > 0 ? (
          <AcademicGroup title="Catálogos" description="Administrá espacios académicos e instrumentos." icon={LibraryBigIcon}>
            <AcademicResourceLinks basePath={basePath} resources={catalogResources} />
          </AcademicGroup>
        ) : null}
      </div>

      <AcademicRecentItems basePath={basePath} items={recentItems} />
    </AcademicShell>
  );
}

function AcademicGroup({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}): React.ReactElement {
  return (
    <section className="bg-muted/25 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </div>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}
