import type { Dispatch, RefObject, SetStateAction } from "react";

import { useRouter } from "next/navigation";

import type { z } from "zod";

import {
  submitEnrollmentApplicationAction,
  updateEnrollmentDraftAction,
} from "@features/enrollment-applications/actions/enrollment-application.actions";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { FIELD_ID_BY_ERROR_PATH } from "@features/enrollment-applications/constants/enrollment-wizard-fields.constants";
import { enrollmentApplicationSubmissionSchema } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import { unwrapEnrollmentResult } from "@features/enrollment-applications/utils/unwrap-enrollment-result.util";

export async function submitEnrollmentWizard({
  blockedDocumentsRef,
  application,
  isCancelDialogOpen,
  setValidationIssues,
  setInvalidInstrumentGroups,
  pendingInstrumentGroups,
  structuredData,
  selectedTrainingPathId,
  courseOptions,
  selectedCourseIds,
  handleActiveTabChange,
  isMinor,
  setPendingFocusFieldId,
  draftSaveQueue,
  setApplication,
  router,
}: {
  blockedDocumentsRef: RefObject<Set<string>>;
  application: EnrollmentApplicationResponse;
  isCancelDialogOpen: boolean;
  setValidationIssues: Dispatch<SetStateAction<z.ZodIssue[]>>;
  setInvalidInstrumentGroups: Dispatch<SetStateAction<string[]>>;
  pendingInstrumentGroups: string[];
  structuredData: EnrollmentApplicationData;
  selectedTrainingPathId: string;
  courseOptions: EnrollmentCourseOption[];
  selectedCourseIds: string[];
  handleActiveTabChange: (tab: string) => void;
  isMinor: boolean;
  setPendingFocusFieldId: Dispatch<SetStateAction<string | null>>;
  draftSaveQueue: RefObject<Promise<void>>;
  setApplication: Dispatch<SetStateAction<EnrollmentApplicationResponse>>;
  router: ReturnType<typeof useRouter>;
}): Promise<{ error?: string; issues?: z.ZodIssue[] }> {
  if (blockedDocumentsRef.current.size > 0) {
    return { error: ENROLLMENT_MESSAGES.DOCUMENTS_SAVE_PENDING };
  }

  if (!application?.applicationId || isCancelDialogOpen) {
    return {};
  }

  setValidationIssues([]);
  setInvalidInstrumentGroups([...pendingInstrumentGroups]);

  const parsed = enrollmentApplicationSubmissionSchema.safeParse(structuredData);
  const issues: z.ZodIssue[] = parsed.success ? [] : [...parsed.error.issues];

  if (!selectedTrainingPathId) {
    issues.push({
      code: "custom",
      message: ENROLLMENT_MESSAGES.TRAINING_PATH_REQUIRED,
      path: ["careerSelection", "trainingPathId"],
    });
  }

  if (pendingInstrumentGroups.length > 0) {
    issues.push({
      code: "custom",
      message: ENROLLMENT_MESSAGES.COURSE_INSTRUMENT_REQUIRED,
      path: ["courses"],
    });
  }

  if (courseOptions.some((course) => selectedCourseIds.includes(course.courseId) && course.eligibility?.eligible === false)) {
    issues.push({
      code: "custom",
      message: ENROLLMENT_MESSAGES.ACADEMIC_SELECTION_INVALID,
      path: ["courses"],
    });
  }

  if (issues.length > 0) {
    setValidationIssues(issues);
    // Auto-navigate to the first invalid step and focus its field
    const firstIssue = issues[0];

    if (firstIssue && firstIssue.path.length > 0) {
      const section = firstIssue.path[0];

      if (section === "personalData") {
        handleActiveTabChange("personal");
      } else if (section === "academicBackground") {
        handleActiveTabChange("education");
      } else if (section === "healthInclusion") {
        handleActiveTabChange("health");
      } else if (section === "responsible" && isMinor) {
        handleActiveTabChange("responsible");
      } else if (section === "careerSelection" || section === "courses") {
        handleActiveTabChange("spaces");
      } else if (section === "preference") {
        handleActiveTabChange("preferences");
      }

      const fieldId = FIELD_ID_BY_ERROR_PATH[firstIssue.path.join(".")];

      if (fieldId) {
        setPendingFocusFieldId(fieldId);
      }
    }

    return { issues };
  }

  try {
    await draftSaveQueue.current;
    const savedApplication = await updateEnrollmentDraftAction(application.applicationId, {
      data: structuredData,
    }).then(unwrapEnrollmentResult);
    setApplication(savedApplication);

    setApplication(await submitEnrollmentApplicationAction(application.applicationId).then(unwrapEnrollmentResult));
    router.refresh();

    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : ENROLLMENT_MESSAGES.SUBMISSION_FAILED,
    };
  }
}
