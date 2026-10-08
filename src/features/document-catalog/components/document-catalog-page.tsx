import type { ReactElement } from "react";

import { notFound } from "next/navigation";

import { z } from "zod";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogBrowser } from "@features/document-catalog/components/document-catalog-browser";
import { DocumentCatalogInstitutionSelect } from "@features/document-catalog/components/document-catalog-institution-select";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function DocumentCatalogPage({
  scope,
  searchParams,
}: {
  scope: AcademicScope;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<ReactElement> {
  const params = await searchParams;

  if (params.documentId !== undefined) {
    notFound();
  }

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
  const breadcrumb = scope === "admin" ? <PlatformBreadcrumb /> : <InstitutionalBreadcrumb />;

  return (
    <DocumentCatalogBrowser
      scope={scope}
      institutionId={institutionId}
      canManage={canManage}
      breadcrumb={breadcrumb}
      institutionSelect={scope === "admin" ? <DocumentCatalogInstitutionSelect value={institutionId} label={institution?.name} /> : undefined}
    />
  );
}
