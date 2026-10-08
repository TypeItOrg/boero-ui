import type { Dispatch, SetStateAction } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import type { PermissionAccess } from "@features/institutional-auth/types/permission-access.types";

export type CourseEnrollmentResultsTableProps = {
  showActionsColumn: boolean;
  data: PaginatedResponse<CourseEnrollment>;
  canWithdraw: boolean;
  permissionScopes: Readonly<Record<string, PermissionAccess>> | undefined;
  canUpdateAcademicStatus: boolean;
  canReadWaitlist: boolean;
  detailBasePath: string | undefined;
  setMutation: Dispatch<SetStateAction<{ enrollment: CourseEnrollment; mode: "withdraw" | "academic" } | undefined>>;
};
