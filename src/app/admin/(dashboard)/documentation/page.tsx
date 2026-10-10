import type { ReactElement } from "react";

import { DocumentCatalogPage } from "@features/document-catalog/components/document-catalog-page";

export const metadata = { title: "Documentación" };

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<ReactElement> {
  return DocumentCatalogPage({ scope: "admin", searchParams });
}
