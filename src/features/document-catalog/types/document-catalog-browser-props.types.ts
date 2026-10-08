import type { ReactNode } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type DocumentCatalogBrowserProps = {
  scope: AcademicScope;
  institutionId?: string;
  canManage: boolean;
  breadcrumb: ReactNode;
  institutionSelect?: ReactNode;
};
