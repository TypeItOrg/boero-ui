import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { hasTrainingPathPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { EnrollmentApplicationTablePresentation } from "@features/enrollment-applications/components/enrollment-application-table-presentation";

type EnrollmentApplicationTableContainerProps = PaginationParams & {
  dataPromise: Promise<PaginatedResponse<EnrollmentApplication>>;
  status?: EnrollmentApplicationStatus;
  hasFilters?: boolean;
  canApprove: boolean;
  canReject: boolean;
  scope?: AcademicScope;
};

export async function EnrollmentApplicationTableContainer({
  dataPromise,
  status,
  hasFilters = Boolean(status),
  page,
  size,
  canApprove,
  canReject,
  scope,
}: EnrollmentApplicationTableContainerProps): Promise<React.ReactElement> {
  const fetched = await dataPromise;
  const user = scope === AcademicScope.ADMIN ? null : await requireInstitutionalUser();
  const data = {
    ...fetched,
    items: fetched.items.map((item) => ({
      ...item,
      canApprove: user
        ? hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_APPROVE, item.trainingPathId ?? "")
        : canApprove,
      canReject: user
        ? hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_REJECT, item.trainingPathId ?? "")
        : canReject,
    })),
  };

  return (
    <EnrollmentApplicationTablePresentation
      key={`${page}-${size}-${status ?? "all"}`}
      data={data}
      page={page}
      size={size}
      status={status}
      hasFilters={hasFilters}
      canApprove={canApprove}
      canReject={canReject}
      scope={scope}
    />
  );
}
