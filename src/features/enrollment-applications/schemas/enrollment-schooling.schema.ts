import { z } from "zod";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

export const educationLevelSchema = z.enum(["NO_SCHOOLING", "INITIAL", "PRIMARY", "SECONDARY", "NON_UNIVERSITY_HIGHER", "UNIVERSITY"]);

// Paso 2: Escolaridad
export const academicBackgroundSchema = z
  .object({
    secondarySchool: z.string().trim().max(255).nullish(),
    currentlyStudying: z.boolean().nullable(),
    educationLevel: educationLevelSchema.nullable(),
    schoolOrigin: z.string().trim().max(150).nullable(),
    currentGradeYear: z.string().trim().max(50).nullable(),
    levelCompleted: z.boolean().nullable(),
    secondaryCompleted: z.boolean().nullable(),
    secondaryDegreeTitle: z.string().trim().max(150).nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.currentlyStudying === null) {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.CURRENTLY_STUDYING_REQUIRED,
        path: ["currentlyStudying"],
      });

      return;
    }

    if (data.educationLevel === null) {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.EDUCATION_LEVEL_REQUIRED,
        path: ["educationLevel"],
      });

      return;
    }

    if (data.currentlyStudying && data.educationLevel === "NO_SCHOOLING") {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.CURRENT_EDUCATION_LEVEL_INVALID,
        path: ["educationLevel"],
      });
    }

    if (data.currentlyStudying && (!data.schoolOrigin || data.schoolOrigin.length === 0)) {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.EDUCATION_INSTITUTION_REQUIRED,
        path: ["schoolOrigin"],
      });
    }

    if (!data.currentlyStudying && !["NO_SCHOOLING", "SECONDARY"].includes(data.educationLevel) && data.levelCompleted === null) {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.EDUCATION_COMPLETION_REQUIRED,
        path: ["levelCompleted"],
      });
    }

    if (["SECONDARY", "NON_UNIVERSITY_HIGHER", "UNIVERSITY"].includes(data.educationLevel) && data.secondaryCompleted === null) {
      ctx.addIssue({
        code: "custom",
        message: ENROLLMENT_MESSAGES.SECONDARY_COMPLETION_REQUIRED,
        path: ["secondaryCompleted"],
      });
    }
  });
