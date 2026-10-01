import type { Metadata } from "next";
import { Suspense } from "react";
import { GraduationCapIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { TeachersSearchForm } from "@features/people/components/teachers-search-form";
import { TeachersTableContainer } from "@features/people/components/teachers-table-container";
import { TeachersTableSkeleton } from "@features/people/components/teachers-table-skeleton";
import { fetchInstitutionTeachers } from "@features/people/services/fetch-institution-teachers.service";
import { parseTeachersPaginationParams, type TeachersSearchParams } from "@features/people/utils/teachers-pagination.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Docentes");
}

export default async function TeachersPage({ searchParams }: { searchParams: Promise<TeachersSearchParams> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar los docentes de esta institución." />;
  }

  const resolvedSearchParams = await searchParams;
  const { page, size, search, sort } = parseTeachersPaginationParams(resolvedSearchParams);
  const teachersPromise = fetchInstitutionTeachers(user.institutionId, { page, size, search, sort });

  return (
    <PlatformPageShell title="Docentes" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      <DataTableNavigationProvider>
        <TeachersSearchForm search={search} size={size} />
        <Suspense fallback={<TeachersTableSkeleton />}>
          <TeachersTableContainer dataPromise={teachersPromise} page={page} size={size} search={search} sort={sort} />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
