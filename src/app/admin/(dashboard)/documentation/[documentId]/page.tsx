import type { ReactElement } from "react";

import type { QueryParamValue } from "@common/types/query-param.types";

import { DocumentCatalogDetailPage } from "@features/document-catalog/components/document-catalog-detail-page";

export const metadata = { title: "Detalle del documento" };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ institutionId?: QueryParamValue; returnTo?: QueryParamValue }>;
}): Promise<ReactElement> {
  return DocumentCatalogDetailPage({ scope: "admin", params, searchParams });
}
