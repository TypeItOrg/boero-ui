import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

export function formatEnrollmentApplicationBreadcrumbLabel(
  application: Pick<EnrollmentApplicationResponse, "trainingPathName" | "academicYearName">,
  applicantName: string,
): string {
  const context = [application.trainingPathName, application.academicYearName].filter(Boolean).join(" ");

  if (!context) {
    return `Solicitud de ${applicantName}`;
  }

  return `Solicitud de ${applicantName} · ${context}`;
}
