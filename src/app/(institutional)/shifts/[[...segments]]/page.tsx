import type { ReactElement } from "react";

import type { Metadata } from "next";

import { getInstitutionalAcademicMetadata, renderInstitutionalAcademicRoute } from "@features/academic/components/institutional-academic-route";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { InstitutionalAcademicPageProps } from "@features/academic/types/institutional-academic-page-props.types";

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalAcademicMetadata(AcademicResource.SHIFT);
}

export default function ShiftsPage(props: InstitutionalAcademicPageProps): Promise<ReactElement> {
  return renderInstitutionalAcademicRoute(AcademicResource.SHIFT, props);
}
