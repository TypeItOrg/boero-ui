export type AcademicRequirement = {
  prerequisiteId: string;
  studyPlanSpaceId: string;
  academicSpaceName: string;
  requiredCondition: "REGULAR" | "PASSED";
  evidence: string[];
  satisfied: boolean;
};
