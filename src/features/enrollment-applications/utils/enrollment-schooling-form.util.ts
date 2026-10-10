import type { EnrollmentAcademicBackground } from "@features/enrollment-applications/types/enrollment-academic-background.types";
import { type SchoolingFormAction } from "@features/enrollment-applications/types/enrollment-schooling-action.types";
import { type SchoolingFormState } from "@features/enrollment-applications/types/enrollment-schooling-state.types";

export function createSchoolingFormState(initial?: Partial<EnrollmentAcademicBackground>): SchoolingFormState {
  return {
    currentlyStudying: initial?.currentlyStudying ?? null,
    educationLevel: initial?.educationLevel ?? null,
    schoolOrigin: initial?.schoolOrigin ?? "",
    currentGradeYear: initial?.currentGradeYear ?? "",
    levelCompleted: initial?.levelCompleted ?? null,
    secondaryCompleted: initial?.secondaryCompleted ?? null,
    secondaryDegreeTitle: initial?.secondaryDegreeTitle ?? "",
  };
}

export function schoolingFormReducer(state: SchoolingFormState, action: SchoolingFormAction): SchoolingFormState {
  switch (action.type) {
    case "attendanceChanged":
      return {
        currentlyStudying: action.value,
        educationLevel: null,
        schoolOrigin: "",
        currentGradeYear: "",
        levelCompleted: null,
        secondaryCompleted: null,
        secondaryDegreeTitle: "",
      };
    case "educationLevelChanged":
      return {
        ...state,
        educationLevel: action.value,
        schoolOrigin: action.value === "NO_SCHOOLING" ? "" : state.schoolOrigin,
        currentGradeYear: action.value === "NO_SCHOOLING" ? "" : state.currentGradeYear,
        levelCompleted: null,
        secondaryCompleted: null,
        secondaryDegreeTitle: "",
      };
    case "schoolOriginChanged":
      return { ...state, schoolOrigin: action.value };
    case "currentGradeYearChanged":
      return { ...state, currentGradeYear: action.value };
    case "levelCompletedChanged":
      return { ...state, levelCompleted: action.value };
    case "secondaryCompletedChanged":
      return {
        ...state,
        secondaryCompleted: action.value,
        secondaryDegreeTitle: action.value ? state.secondaryDegreeTitle : "",
      };
    case "secondaryDegreeTitleChanged":
      return { ...state, secondaryDegreeTitle: action.value };
  }
}
