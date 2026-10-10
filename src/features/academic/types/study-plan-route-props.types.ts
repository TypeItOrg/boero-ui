import type { ReactNode } from "react";

import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicBreadcrumbOptions } from "@features/academic/types/academic-breadcrumb-options.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type StudyPlanRouteProps = {
  access: AcademicAccess;
  action: string;
  basePath: string;
  breadcrumb: ReactNode;
  id: string;
  institutionId: string;
  leaf?: string;
  leafId?: string;
  nestedAction?: string;
  nestedId?: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => ReactNode;
  searchParams?: Record<string, string | string[] | undefined>;
  scope: AcademicScope;
};
