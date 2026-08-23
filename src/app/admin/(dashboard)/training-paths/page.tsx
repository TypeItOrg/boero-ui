import { PlatformAcademicCollectionPage } from "@features/academic/components/platform-academic-collection-page";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";

export const metadata = { title: "Trayectos formativos" };

export default async function Page({ searchParams }: { searchParams: Promise<AcademicSearchParams> }): Promise<React.ReactElement> {
  return <PlatformAcademicCollectionPage resource={AcademicResource.TRAINING_PATH} searchParams={await searchParams} />;
}
