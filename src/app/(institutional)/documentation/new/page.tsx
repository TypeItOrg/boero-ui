import type { ReactElement } from "react";

import type { QueryParamValue } from "@common/types/query-param.types";

import { DocumentCatalogNewPage } from "@features/document-catalog/components/document-catalog-new-page";

export const metadata = { title: "Nuevo documento" };

export default function Page({ searchParams }: { searchParams: Promise<{ returnTo?: QueryParamValue }> }): Promise<ReactElement> {
  return DocumentCatalogNewPage({ scope: "institutional", searchParams });
}
