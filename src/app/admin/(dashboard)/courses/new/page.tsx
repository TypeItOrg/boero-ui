import { PlatformAcademicFormPage } from "@features/academic/components/platform-academic-form-page";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const metadata = { title: "Nuevo curso" };

export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  return <PlatformAcademicFormPage resource={AcademicResource.COURSE} returnTo={returnTo} />;
}
