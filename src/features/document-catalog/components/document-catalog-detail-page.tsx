import type { ReactElement } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { FileTextIcon } from "lucide-react";
import { z } from "zod";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogReadDetail } from "@features/document-catalog/components/document-catalog-read-detail";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogEditPageUrl, getDocumentCatalogPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function DocumentCatalogDetailPage({
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
  let canManage: boolean;

  if (scope === "admin") {
    await requirePlatformAccount();
    const parsedInstitutionId = z.uuid().safeParse(query.institutionId);

    if (!parsedInstitutionId.success) {
      notFound();
    }

    institutionId = parsedInstitutionId.data;
    canManage = true;
  } else {
    const user = await requireInstitutionalUser();

    if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_READ)) {
      notFound();
    }

    institutionId = user.institutionId;
    canManage = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_MANAGE);
  }

  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/document-definitions/${parsedId.data}`);

  if (response.status === 404 || response.status === 403) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("No se pudo consultar el documento.");
  }

  const document: DocumentDefinition = await response.json();
  const institution = scope === "admin" ? await fetchInstitution(institutionId) : undefined;
  const returnTo = getSafeReturnTo(query.returnTo, getDocumentCatalogPageUrl(scope, institutionId));
  const segmentHrefs = { documentation: returnTo };
  const segmentLabels = { [parsedId.data]: document.name };

  return (
    <PlatformPageShell
      title={document.name}
      breadcrumb={
        scope === "admin" ? (
          <PlatformBreadcrumb segmentHrefs={segmentHrefs} segmentLabels={segmentLabels} />
        ) : (
          <InstitutionalBreadcrumb segmentHrefs={segmentHrefs} segmentLabels={segmentLabels} />
        )
      }
      actions={<PlatformPageIcon icon={FileTextIcon} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild size="lg" variant="outline">
          <Link href={returnTo}>Volver</Link>
        </Button>
        {canManage ? (
          <Button asChild size="lg">
            <ReturnToLink href={getDocumentCatalogEditPageUrl(scope, institutionId, document.id)}>Editar</ReturnToLink>
          </Button>
        ) : null}
      </div>
      <DocumentCatalogReadDetail
        key={document.id}
        document={document}
        scope={scope}
        institutionId={institutionId}
        institutionName={institution?.name}
      />
    </PlatformPageShell>
  );
}
