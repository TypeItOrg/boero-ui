import type { Metadata } from "next";

import {
  getInstitutionalAcademicMetadata,
  renderInstitutionalAcademicRoute,
} from "@features/academic/components/institutional-academic-route";
import type { InstitutionalAcademicPageProps } from "@features/academic/types/institutional-academic-page-props.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalAcademicMetadata(AcademicResource.ACADEMIC_SPACE);
}

export default function AcademicSpacesPage(props: InstitutionalAcademicPageProps): Promise<React.ReactElement> {
  return renderInstitutionalAcademicRoute(AcademicResource.ACADEMIC_SPACE, props);
}
