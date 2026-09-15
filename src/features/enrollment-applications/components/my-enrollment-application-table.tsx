import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { MyEnrollmentApplicationTablePresentation } from "@features/enrollment-applications/components/my-enrollment-application-table-presentation";

type MyEnrollmentApplicationTableContainerProps = PaginationParams & {
  dataPromise: Promise<PaginatedResponse<EnrollmentApplication>>;
  status?: EnrollmentApplicationStatus;
};

export async function MyEnrollmentApplicationTableContainer({
  dataPromise,
  status,
  page,
  size,
}: MyEnrollmentApplicationTableContainerProps): Promise<React.ReactElement> {
  const data = await dataPromise;

  return <MyEnrollmentApplicationTablePresentation key={`${page}-${size}-${status ?? "all"}`} data={data} page={page} size={size} status={status} />;
}
