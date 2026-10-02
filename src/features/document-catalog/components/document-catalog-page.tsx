import { notFound } from "next/navigation";
import { FileTextIcon } from "lucide-react";
import { z } from "zod";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { DocumentCatalogBrowser } from "@features/document-catalog/components/document-catalog-browser";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { DocumentCatalogInstitutionSelect } from "@features/document-catalog/components/document-catalog-institution-select";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
export async function DocumentCatalogPage({
  scope,
  searchParams,
}: {
  scope: AcademicScope;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const params = await searchParams;
  let institutionId: string | undefined;
  let canManage = false;
  if (scope === "admin") {
    await requirePlatformAccount();
    const parsed = z.uuid().safeParse(params.institutionId);
    institutionId = parsed.success ? parsed.data : undefined;
    canManage = true;
  } else {
    const user = await requireInstitutionalUser();
    if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_READ)) {
      notFound();
    }
    institutionId = user.institutionId;
    canManage = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_MANAGE);
  }
  const institution = scope === "admin" && institutionId ? await fetchInstitution(institutionId) : undefined;
  const returnTo = getSafeReturnTo(
    params.returnTo,
    scope === "admin" ? `/admin/documentation${institutionId ? "?institutionId=" + institutionId : ""}` : "/documentation",
  );
  let selected: DocumentDefinition | undefined;
  const selectedId = z.uuid().safeParse(params.documentId);
  if (institutionId && selectedId.success) {
    const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/document-definitions/${selectedId.data}`);
    if (!response.ok) {
      notFound();
    }
    selected = await response.json();
  }
  return (
    <PlatformPageShell
      title="Documentación"
      breadcrumb={scope === "admin" ? <PlatformBreadcrumb /> : <InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={FileTextIcon} />}
    >
      {institutionId ? (
        <DocumentCatalogBrowser
          key={institutionId}
          scope={scope}
          institutionId={institutionId}
          canManage={canManage}
          institutionSelect={scope === "admin" ? <DocumentCatalogInstitutionSelect value={institutionId} label={institution?.name} /> : undefined}
          initialSelected={selected}
          returnTo={typeof params.returnTo === "string" ? returnTo : undefined}
        />
      ) : (
        <DataTableNavigationProvider>
          <div className="space-y-6">
            <DataTableFilters>
              <DocumentCatalogInstitutionSelect />
            </DataTableFilters>
            <p>Seleccioná una institución para consultar su documentación.</p>
          </div>
        </DataTableNavigationProvider>
      )}
    </PlatformPageShell>
  );
}
