import type { ReactNode } from "react";

import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicBreadcrumbOptions } from "@features/academic/types/academic-breadcrumb-options.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type RouteDetailInput = {
  access: AcademicAccess;
  action?: string;
  basePath: string;
  breadcrumb: ReactNode;
  id: string;
  institutionId: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => ReactNode;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  searchParams: Record<string, string | string[] | undefined>;
};
