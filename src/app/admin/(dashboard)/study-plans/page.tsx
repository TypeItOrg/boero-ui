import { PlatformAcademicCollectionPage } from "@features/academic/components/platform-academic-collection-page";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";

export const metadata = { title: "Planes de estudio" };

export default async function Page({ searchParams }: { searchParams: Promise<AcademicSearchParams> }): Promise<React.ReactElement> {
  return <PlatformAcademicCollectionPage resource={AcademicResource.STUDY_PLAN} searchParams={await searchParams} />;
}
