import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { FileTextIcon } from "lucide-react";
import { z } from "zod";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { PlatformDocumentCatalogNewForm } from "@features/document-catalog/components/platform-document-catalog-new-form";
import type { DocumentDefinitionDefaults } from "@features/document-catalog/types/document-definition-defaults.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function DocumentCatalogNewPage({
  scope,
  searchParams,
}: {
  scope: AcademicScope;
  searchParams: Promise<{
    institutionId?: QueryParamValue;
    returnTo?: QueryParamValue;
    copyFrom?: QueryParamValue;
    sourceInstitutionId?: QueryParamValue;
  }>;
}): Promise<ReactElement> {
  const params = await searchParams;
  let institutionId: string | undefined;

  if (scope === "admin") {
    await requirePlatformAccount();
    const parsed = z.uuid().safeParse(params.institutionId);

    if (params.institutionId !== undefined && !parsed.success) {
      notFound();
    }

    institutionId = parsed.success ? parsed.data : undefined;
  } else {
    const user = await requireInstitutionalUser();

    if (
      !hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_READ) ||
      !hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_MANAGE)
    ) {
      notFound();
    }

    institutionId = user.institutionId;
  }

  let defaults: DocumentDefinitionDefaults | undefined;
  let copySourceInstitutionId: string | undefined;

  if (params.copyFrom !== undefined || params.sourceInstitutionId !== undefined) {
    const sourceId = z.uuid().safeParse(params.copyFrom);
    const sourceInstitutionId = z.uuid().safeParse(params.sourceInstitutionId);

    if (scope !== "admin" || !sourceId.success || !sourceInstitutionId.success) {
      notFound();
    }

    if (institutionId?.toLowerCase() === sourceInstitutionId.data.toLowerCase()) {
      notFound();
    }

    copySourceInstitutionId = sourceInstitutionId.data.toLowerCase();

    const response = await academicApiFetch(
      "admin",
      `${getAcademicApiBase("admin", sourceInstitutionId.data)}/document-definitions/${sourceId.data}`,
    );

    if (!response.ok) {
      notFound();
    }

    const source: DocumentDefinition = await response.json();
    defaults = {
      name: source.name,
      instructions: source.instructions,
      allowedFormats: source.allowedFormats,
      active: source.active,
    };
  }

  const institution = scope === "admin" && institutionId ? await fetchInstitution(institutionId) : undefined;
  const returnTo = getSafeReturnTo(params.returnTo, institutionId ? getDocumentCatalogPageUrl(scope, institutionId) : "/admin/documentation");
  const segmentHrefs = { documentation: returnTo };

  return (
    <PlatformPageShell
      title="Nuevo documento"
      breadcrumb={scope === "admin" ? <PlatformBreadcrumb segmentHrefs={segmentHrefs} /> : <InstitutionalBreadcrumb segmentHrefs={segmentHrefs} />}
      actions={<PlatformPageIcon icon={FileTextIcon} />}
    >
      {scope === "admin" ? (
        <PlatformDocumentCatalogNewForm
          institutionId={institutionId}
          institutionName={institution?.name}
          returnTo={returnTo}
          defaults={defaults}
          copySourceInstitutionId={copySourceInstitutionId}
        />
      ) : institutionId ? (
        <DocumentCatalogForm scope={scope} institutionId={institutionId} returnTo={returnTo} />
      ) : null}
    </PlatformPageShell>
  );
}
