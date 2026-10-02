export const metadata = { title: "Documentación" };
import { DocumentCatalogPage } from "@features/document-catalog/components/document-catalog-page";
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  return DocumentCatalogPage({ scope: "admin", searchParams });
}
