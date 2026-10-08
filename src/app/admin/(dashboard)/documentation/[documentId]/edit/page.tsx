import type { ReactElement } from "react";

import type { QueryParamValue } from "@common/types/query-param.types";

import { DocumentCatalogEditPage } from "@features/document-catalog/components/document-catalog-edit-page";

export const metadata = { title: "Editar documento" };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ institutionId?: QueryParamValue; returnTo?: QueryParamValue }>;
}): Promise<ReactElement> {
  return DocumentCatalogEditPage({ scope: "admin", params, searchParams });
}
