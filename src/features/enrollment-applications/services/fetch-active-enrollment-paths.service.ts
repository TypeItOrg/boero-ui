import "server-only";

import { ACTIVE_ENROLLMENT_APPLICATION_STATUSES } from "@features/enrollment-applications/constants/enrollment-application.constants";

import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";

export async function fetchActiveEnrollmentPaths(institutionId: string) {
  const trainingPathIds = new Set<string>();

  // The self-service endpoint only filters by status. Read active applications in
  // bounded pages to compute exclusions, without sending their personal data to the form.
  await Promise.all(
    ACTIVE_ENROLLMENT_APPLICATION_STATUSES.map(async (status) => {
      let page = 0;

      while (true) {
        const applications = await fetchMyEnrollmentApplications(institutionId, { page, size: 50, status });

        for (const application of applications.items) {
          const trainingPathId = application.trainingPathId ?? application.data?.careerSelection?.trainingPathId;

          if (trainingPathId) {
            trainingPathIds.add(trainingPathId);
          }
        }

        page += 1;

        if (applications.items.length === 0 || page >= applications.totalPages) {
          break;
        }
      }
    }),
  );

  return { trainingPathIds };
}
