import { z } from "zod";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import {
  healthInclusionSchema,
  personalDataSchema,
  preferenceSchema,
  responsibleSchema,
} from "@features/enrollment-applications/schemas/enrollment-applicant-data.schema";
import { academicBackgroundSchema, educationLevelSchema } from "@features/enrollment-applications/schemas/enrollment-schooling.schema";
import { calculateAge } from "@features/enrollment-applications/utils/enrollment-age.util";

export const startEnrollmentApplicationSchema = z.object({
  enrollmentPeriodId: z.uuid().optional(),
  trainingPathId: z.string().uuid(ENROLLMENT_MESSAGES.TRAINING_PATH_ID_INVALID),
  academicYearId: z.string().uuid(ENROLLMENT_MESSAGES.ACADEMIC_YEAR_ID_INVALID).optional(),
  applicantPersonId: z.string().uuid(ENROLLMENT_MESSAGES.APPLICANT_PERSON_ID_INVALID).optional(),
});

// Paso: Trayecto Formativo
export const careerSelectionSchema = z
  .object({
    trainingPathId: z.string().trim().optional(),
  })
  .optional();

// Paso: Adjunto
export const enrollmentAttachmentSchema = z.object({
  id: z.string(),
  requirementId: z.string().uuid(),
  originalFileName: z.string(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  url: z.string().optional(),
  createdAt: z.string().optional(),
});

const enrollmentCoursesSchema = z.array(z.object({ courseId: z.uuid(), preferredTeacherId: z.uuid().nullable().optional() }));

// Schema para guardar borrador (permite campos incompletos durante el autoguardado)
export const updateEnrollmentDraftSchema = z.object({
  data: z.object({
    academicBackground: z
      .object({
        secondarySchool: z.string().max(255).optional(),
        currentlyStudying: z.boolean().nullable().optional(),
        educationLevel: educationLevelSchema.nullable().optional(),
        schoolOrigin: z.string().max(150).nullable().optional(),
        currentGradeYear: z.string().max(50).nullable().optional(),
        levelCompleted: z.boolean().nullable().optional(),
        secondaryCompleted: z.boolean().nullable().optional(),
        secondaryDegreeTitle: z.string().max(150).nullable().optional(),
      })
      .optional(),
    healthInclusion: z
      .object({
        receivesReasonableAdjustments: z.boolean().optional(),
        adjustmentDetails: z.string().optional(),
      })
      .optional(),
    responsible: responsibleSchema.partial().optional(),
    preference: z
      .object({
        preferredShift: z.string().max(150).optional(),
        allowsImageUse: z.boolean().optional(),
        isReenrolling: z.boolean().optional(),
        previousTeacher: z.string().max(255).optional(),
      })
      .optional(),
    careerSelection: z.object({ trainingPathId: z.uuid().optional() }).optional(),
    courses: enrollmentCoursesSchema.optional(),
  }),
});

// Schema completo y estricto para Enviar Inscripción (valida los pasos y reglas condicionales)
export const enrollmentApplicationSubmissionSchema = z
  .object({
    // A minor has no email of their own (their contact is the responsible's), so it is checked below only for adults.
    personalData: personalDataSchema.extend({ email: z.string().trim().nullish() }),
    academicBackground: academicBackgroundSchema,
    healthInclusion: healthInclusionSchema,
    responsible: responsibleSchema,
    careerSelection: careerSelectionSchema,
    courses: enrollmentCoursesSchema.min(1, ENROLLMENT_MESSAGES.SPACE_REQUIRED),
    preference: preferenceSchema,
    attachments: z.array(enrollmentAttachmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // 1. Condicional: Si edad < 18, tutor legal obligatorio
    const age = calculateAge(data.personalData.birthDate);

    const isMinor = age !== null && age < 18;

    if (!isMinor) {
      const email = data.personalData.email;

      if (!email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: ENROLLMENT_MESSAGES.EMAIL_REQUIRED, path: ["personalData", "email"] });
      } else if (!z.email().safeParse(email).success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: ENROLLMENT_MESSAGES.EMAIL_INVALID, path: ["personalData", "email"] });
      }
    }

    if (isMinor) {
      const resp = data.responsible;

      if (!resp?.fullName || resp.fullName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_NAME_REQUIRED,
          path: ["responsible", "fullName"],
        });
      }

      if (!resp?.documentNumber || resp.documentNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_DOCUMENT_REQUIRED,
          path: ["responsible", "documentNumber"],
        });
      }

      if (!resp?.phoneNumber || resp.phoneNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_PHONE_REQUIRED,
          path: ["responsible", "phoneNumber"],
        });
      }

      if (!resp?.email || resp.email.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_EMAIL_REQUIRED,
          path: ["responsible", "email"],
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resp.email.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_EMAIL_INVALID,
          path: ["responsible", "email"],
        });
      }

      if (!resp?.occupation || resp.occupation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_OCCUPATION_REQUIRED,
          path: ["responsible", "occupation"],
        });
      }

      if (!resp?.educationLevel || resp.educationLevel.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.RESPONSIBLE_EDUCATION_REQUIRED,
          path: ["responsible", "educationLevel"],
        });
      }
    }

    // 2. Condicional: Si recibe ajustes razonables, detalle e informe de salud obligatorios
    if (data.healthInclusion.receivesReasonableAdjustments) {
      if (!data.healthInclusion.adjustmentDetails || data.healthInclusion.adjustmentDetails.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.ADJUSTMENT_DETAILS_REQUIRED,
          path: ["healthInclusion", "adjustmentDetails"],
        });
      }
    }

    // 3. Condicional: Si es reingresante, docente previo obligatorio
    if (data.preference.isReenrolling) {
      if (!data.preference.previousTeacher || data.preference.previousTeacher.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: ENROLLMENT_MESSAGES.PREVIOUS_TEACHER_REQUIRED,
          path: ["preference", "previousTeacher"],
        });
      }
    }
  });

export type EnrollmentApplicationSubmissionInput = z.infer<typeof enrollmentApplicationSubmissionSchema>;

export { calculateAge } from "@features/enrollment-applications/utils/enrollment-age.util";

export { academicBackgroundSchema } from "@features/enrollment-applications/schemas/enrollment-schooling.schema";

export { personalDataSchema } from "@features/enrollment-applications/schemas/enrollment-applicant-data.schema";

export { healthInclusionSchema } from "@features/enrollment-applications/schemas/enrollment-applicant-data.schema";

export { responsibleSchema } from "@features/enrollment-applications/schemas/enrollment-applicant-data.schema";

export { preferenceSchema } from "@features/enrollment-applications/schemas/enrollment-applicant-data.schema";
