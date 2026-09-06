import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { EnrollmentApplicationTablePresentation } from "./enrollment-application-table-presentation";

type EnrollmentApplicationTableContainerProps = PaginationParams & {
  dataPromise: Promise<PaginatedResponse<EnrollmentApplication>>;
  status?: EnrollmentApplicationStatus;
  canApprove: boolean;
  canReject: boolean;
};

export async function EnrollmentApplicationTableContainer({
  dataPromise,
  status,
  page,
  size,
  canApprove,
  canReject,
}: EnrollmentApplicationTableContainerProps): Promise<React.ReactElement> {
  const data = await dataPromise;

  return (
    <EnrollmentApplicationTablePresentation
      key={`${page}-${size}-${status ?? "all"}`}
      data={data}
      page={page}
      size={size}
      status={status}
      canApprove={canApprove}
      canReject={canReject}
    />
  );
}
