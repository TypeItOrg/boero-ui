"use client";

import type { ReactElement } from "react";

import { ClipboardCheckIcon } from "lucide-react";

import { Card, CardHeader } from "@common/components/ui/card";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentAdmissionHistory } from "@features/enrollment-applications/components/enrollment-admission-history";
import { EnrollmentApplicationCoursesManagement } from "@features/enrollment-applications/components/enrollment-application-courses-management";
import { SECTION_CARD_CLASS_NAME } from "@features/enrollment-applications/components/enrollment-detail-card";
import { EnrollmentDocuments } from "@features/enrollment-applications/components/enrollment-documents";
import { EnrollmentHealthSummary } from "@features/enrollment-applications/components/enrollment-health-summary";
import { EnrollmentPersonalSummary } from "@features/enrollment-applications/components/enrollment-personal-summary";
import { EnrollmentPreferenceSummary } from "@features/enrollment-applications/components/enrollment-preference-summary";
import { EnrollmentResponsibleSummary } from "@features/enrollment-applications/components/enrollment-responsible-summary";
import { EnrollmentSchoolingSummary } from "@features/enrollment-applications/components/enrollment-schooling-summary";
import { EnrollmentSpacesSummary } from "@features/enrollment-applications/components/enrollment-spaces-summary";
import { getStatusAlert } from "@features/enrollment-applications/components/enrollment-status-alert";
import { getStatusBadge } from "@features/enrollment-applications/components/enrollment-status-badge";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

interface EnrollmentStatusCardProps {
  application: EnrollmentApplicationResponse;
  showApplicantAlert?: boolean;
  showRequirementChanges?: boolean;
  administrativeView?: boolean;
  scope?: AcademicScope;
  institutionId?: string;
  canManageCourses?: boolean;
  canEnrollCourses?: boolean;
  canRejectCourses?: boolean;
  canReadCourseWaitlist?: boolean;
}

export function EnrollmentStatusCard({
  application,
  showApplicantAlert = true,
  showRequirementChanges = false,
  administrativeView = false,
  scope = AcademicScope.INSTITUTIONAL,
  institutionId,
  canManageCourses = false,
  canEnrollCourses = false,
  canRejectCourses = false,
  canReadCourseWaitlist = false,
}: EnrollmentStatusCardProps): ReactElement {
  const data = application.data || {};
  const personal = data.personalData || {};
  const academic = data.academicBackground || {};
  const health = data.healthInclusion || {};
  const responsible = data.responsible || {};
  const preference = data.preference || {};
  const spaces = application.spaces || [];

  const canManageApplicationCourses =
    canManageCourses &&
    (application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED || application.status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED);

  return (
    <div className="flex flex-col gap-4">
      <Card className={SECTION_CARD_CLASS_NAME}>
        <CardHeader>
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 @xl/card-header:grid-cols-[auto_minmax(0,1fr)_auto] @xl/card-header:gap-x-3.5 @xl/card-header:gap-y-0.5">
            <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl @xl/card-header:row-span-2 @xl/card-header:size-11">
              <ClipboardCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <h2 className="font-heading min-w-0 text-base leading-snug font-medium text-balance break-words">Estado de la solicitud</h2>
            <div className="col-span-2 min-w-0 @xl/card-header:col-span-1 @xl/card-header:col-start-3 @xl/card-header:row-span-2 @xl/card-header:row-start-1 @xl/card-header:justify-self-end">
              {getStatusBadge(application.status)}
            </div>
            <p className="text-muted-foreground col-span-2 min-w-0 text-sm text-pretty @xl/card-header:col-span-1 @xl/card-header:col-start-2 @xl/card-header:row-start-2">
              Actualizada el{" "}
              <time dateTime={application.updatedAt} className="tabular-nums">
                {formatEnrollmentApplicationDateTime(application.updatedAt)}
              </time>
            </p>
          </div>
        </CardHeader>
      </Card>

      {showApplicantAlert ? getStatusAlert(application) : null}

      {canManageApplicationCourses ? (
        <EnrollmentApplicationCoursesManagement
          applicationId={application.applicationId}
          institutionId={institutionId ?? application.institutionId}
          scope={scope}
          courses={application.courses ?? []}
          canEnroll={canEnrollCourses}
          canReject={canRejectCourses}
          canReadWaitlist={canReadCourseWaitlist}
        />
      ) : null}

      {application.courses && application.courses.length > 0 && !canManageApplicationCourses ? (
        <EnrollmentApplicationCoursesManagement
          applicationId={application.applicationId}
          institutionId={institutionId ?? application.institutionId}
          scope={scope}
          courses={application.courses}
          canEnroll={false}
          canReject={false}
          canReadWaitlist={canReadCourseWaitlist}
          readOnly
        />
      ) : null}

      {application.admissionHistory?.length ? <EnrollmentAdmissionHistory application={application} /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <EnrollmentPersonalSummary personal={personal} />

        <EnrollmentSchoolingSummary academic={academic} />

        <EnrollmentHealthSummary health={health} />
        <EnrollmentResponsibleSummary responsible={responsible} />

        {spaces.length > 0 ? <EnrollmentSpacesSummary application={application} spaces={spaces} /> : null}

        <EnrollmentPreferenceSummary preference={preference} />

        <div className="xl:col-span-2">
          <EnrollmentDocuments
            key={application.updatedAt}
            application={application}
            scope={scope}
            showRequirementChanges={showRequirementChanges}
            administrativeView={administrativeView}
          />
        </div>
      </div>
    </div>
  );
}
