import "server-only";

import { ACTIVE_ENROLLMENT_APPLICATION_STATUSES } from "@features/enrollment-applications/constants/enrollment-application.constants";

import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import { fetchAcademicOffer } from "@features/academic-offers/services/academic-offer.service";

export async function fetchActiveEnrollmentPaths(institutionId: string) {
  const trainingPathIds = new Set<string>();
  const studyPlanIds = new Set<string>();
  const unresolvedStudyPlanIds = new Set<string>();

  // The self-service endpoint only filters by status. Read active applications in
  // bounded pages to compute exclusions, without sending their personal data to the form.
  await Promise.all(
    ACTIVE_ENROLLMENT_APPLICATION_STATUSES.map(async (status) => {
      let page = 0;

      while (true) {
        const applications = await fetchMyEnrollmentApplications(institutionId, { page, size: 50, status });

        for (const application of applications.items) {
          studyPlanIds.add(application.studyPlanId);
          const trainingPathId = application.data?.careerSelection?.trainingPathId;

          if (trainingPathId) {
            trainingPathIds.add(trainingPathId);
          } else {
            unresolvedStudyPlanIds.add(application.studyPlanId);
          }
        }

        page += 1;

        if (applications.items.length === 0 || page >= applications.totalPages) {
          break;
        }
      }
    }),
  );

  // Older drafts may not have a careerSelection yet. Resolve their plans by ID
  // so exclusions do not depend on which catalog page the applicant is viewing.
  await Promise.all(
    [...unresolvedStudyPlanIds].map(async (studyPlanId) => {
      const offer = await fetchAcademicOffer(institutionId, studyPlanId);

      if (offer) {
        trainingPathIds.add(offer.offer.trainingPathId);
      }
    }),
  );

  return { trainingPathIds, studyPlanIds };
}
