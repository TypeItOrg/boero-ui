import { PlatformAcademicFormPage } from "@features/academic/components/platform-academic-form-page";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const metadata = { title: "Nuevo plan de estudio" };

export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  return <PlatformAcademicFormPage resource={AcademicResource.STUDY_PLAN} returnTo={returnTo} />;
}
