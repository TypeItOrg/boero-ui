import type { ReactElement } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";

import { MyEnrollmentApplicationTablePresentation } from "@features/enrollment-applications/components/my-enrollment-application-table-presentation";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";

type MyEnrollmentApplicationTableContainerProps = PaginationParams & {
  dataPromise: Promise<PaginatedResponse<EnrollmentApplication>>;
  status?: EnrollmentApplicationStatus;
  currentPersonId?: string;
  showApplicant?: boolean;
};

export async function MyEnrollmentApplicationTableContainer({
  dataPromise,
  status,
  page,
  size,
  currentPersonId,
  showApplicant,
}: MyEnrollmentApplicationTableContainerProps): Promise<ReactElement> {
  const data = await dataPromise;

  return (
    <MyEnrollmentApplicationTablePresentation
      key={`${page}-${size}-${status ?? "all"}`}
      currentPersonId={currentPersonId}
      data={data}
      page={page}
      showApplicant={showApplicant}
      size={size}
      status={status}
    />
  );
}
