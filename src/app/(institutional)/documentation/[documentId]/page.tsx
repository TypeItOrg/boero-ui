import type { QueryParamValue } from "@common/types/query-param.types";
import { DocumentCatalogDetailPage } from "@features/document-catalog/components/document-catalog-detail-page";

export const metadata = { title: "Detalle del documento" };

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  return DocumentCatalogDetailPage({ scope: "institutional", params, searchParams });
}
