import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { FileTextIcon } from "lucide-react";
import { z } from "zod";

import type { QueryParamValue } from "@common/types/query-param.types";
import { appendReturnTo, getSafeReturnTo } from "@common/utils/return-to.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { PlatformDocumentCatalogEditForm } from "@features/document-catalog/components/platform-document-catalog-edit-form";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogDetailPageUrl, getDocumentCatalogPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function DocumentCatalogEditPage({
  scope,
  params,
  searchParams,
}: {
  scope: AcademicScope;
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ institutionId?: QueryParamValue; returnTo?: QueryParamValue }>;
}): Promise<ReactElement> {
  const [{ documentId: rawId }, query] = await Promise.all([params, searchParams]);

  const parsedId = z.uuid().safeParse(rawId);

  if (!parsedId.success) {
    notFound();
  }

  let institutionId: string;

  if (scope === "admin") {
    await requirePlatformAccount();

    const parsedInstitutionId = z.uuid().safeParse(query.institutionId);

    if (!parsedInstitutionId.success) {
      notFound();
    }

    institutionId = parsedInstitutionId.data;
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

  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/document-definitions/${parsedId.data}`);

  if (!response.ok) {
    notFound();
  }

  const document: DocumentDefinition = await response.json();

  const institution = scope === "admin" ? await fetchInstitution(institutionId) : undefined;

  const returnTo = getSafeReturnTo(query.returnTo, getDocumentCatalogPageUrl(scope, institutionId));

  const detailUrl = getDocumentCatalogDetailPageUrl(scope, institutionId, document.id);

  const origin = new URL(returnTo, "https://return-to.invalid");

  const catalogReturnTo =
    origin.pathname === detailUrl.split("?")[0]
      ? getSafeReturnTo(origin.searchParams.get("returnTo") ?? undefined, getDocumentCatalogPageUrl(scope, institutionId))
      : returnTo;

  const segmentHrefs = {
    documentation: catalogReturnTo,
    [document.id]: appendReturnTo(detailUrl, catalogReturnTo),
  };

  const segmentLabels = { [document.id]: document.name };

  return (
    <PlatformPageShell
      title="Editar documento"
      breadcrumb={
        scope === "admin" ? (
          <PlatformBreadcrumb segmentLabels={segmentLabels} segmentHrefs={segmentHrefs} />
        ) : (
          <InstitutionalBreadcrumb segmentLabels={segmentLabels} segmentHrefs={segmentHrefs} />
        )
      }
      actions={<PlatformPageIcon icon={FileTextIcon} />}
    >
      {scope === "admin" && institution ? (
        <PlatformDocumentCatalogEditForm document={document} institutionName={institution.name} returnTo={returnTo} />
      ) : (
        <DocumentCatalogForm scope={scope} institutionId={institutionId} initial={document} returnTo={returnTo} />
      )}
    </PlatformPageShell>
  );
}
