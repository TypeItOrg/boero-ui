import type { FieldActionState } from "@common/utils/action-state.util";

export type EnrollmentApplicationActionState = FieldActionState<
  "academicYearId" | "studyPlanId" | "trainingPathId" | "studyPlanSpaceIds" | "studyPlanSpaceInstrumentIds"
>;
