import { ENROLLMENT_DOCUMENT_TYPE } from "@features/enrollment-applications/types/enrollment-document-type.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { z } from "zod";
import { parseDateInput } from "@common/utils/date-input.util";

const BUSINESS_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function calculateAge(birthDate: string | Date | undefined): number | null {
  if (!birthDate) {
    return null;
  }

  const date = typeof birthDate === "string" ? parseDateInput(birthDate) : birthDate;

  if (!date || isNaN(date.getTime())) {
    return null;
  }

  const parts = BUSINESS_DATE_FORMATTER.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  let age = year - date.getFullYear();
  const monthDiff = month - 1 - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && day < date.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export const startEnrollmentApplicationSchema = z.object({
  studyPlanId: z.string().uuid(ENROLLMENT_MESSAGES.STUDY_PLAN_ID_INVALID),
  academicYearId: z.string().uuid(ENROLLMENT_MESSAGES.ACADEMIC_YEAR_ID_INVALID),
});

// Paso 1: Datos Personales y Contacto
export const personalDataSchema = z.object({
  firstName: z.string().trim().min(1, ENROLLMENT_MESSAGES.NAME_REQUIRED),
  lastName: z.string().trim().min(1, ENROLLMENT_MESSAGES.LAST_NAME_REQUIRED),
  documentNumber: z.string().trim().min(1, ENROLLMENT_MESSAGES.DOCUMENT_REQUIRED),
  birthDate: z.string().trim().min(1, ENROLLMENT_MESSAGES.BIRTH_DATE_REQUIRED),
  phoneNumber: z.string().trim().nullish(),
  email: z.string().trim().min(1, ENROLLMENT_MESSAGES.EMAIL_REQUIRED).email(ENROLLMENT_MESSAGES.EMAIL_INVALID),
});

// Paso 2: Escolaridad de Base
export const academicBackgroundSchema = z.object({
  secondarySchool: z.string().trim().min(1, ENROLLMENT_MESSAGES.SCHOOL_REQUIRED),
  currentGradeYear: z.string().trim().optional(),
  secondaryCompleted: z.boolean().default(false),
  secondaryDegreeTitle: z.string().trim().optional(),
});

// Paso 3: Salud e Inclusión
export const healthInclusionSchema = z.object({
  receivesReasonableAdjustments: z.boolean().default(false),
  adjustmentDetails: z.string().trim().optional(),
});

// Paso 4: Responsable / Tutor Legal
export const responsibleSchema = z.object({
  fullName: z.string().trim().optional(),
  documentNumber: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
  email: z.string().trim().optional(),
  occupation: z.string().trim().optional(),
  educationLevel: z.string().trim().optional(),
});

// Paso 5: Preferencias
export const preferenceSchema = z.object({
  preferredShift: z.string().trim().min(1, ENROLLMENT_MESSAGES.SHIFT_REQUIRED),
  allowsImageUse: z.boolean().default(false),
  isReenrolling: z.boolean().default(false),
  previousTeacher: z.string().trim().optional(),
});

// Paso: Trayecto Formativo
export const careerSelectionSchema = z
  .object({
    trainingPathId: z.string().trim().optional(),
  })
  .optional();

// Paso: Espacios Académicos
export const academicSpaceSelectionSchema = z
  .object({
    studyPlanSpaceIds: z.array(z.string().trim()).optional(),
  })
  .optional();

// Paso: Instrumentos
export const instrumentSelectionSchema = z
  .object({
    studyPlanSpaceInstrumentIds: z.record(z.string(), z.string()).optional(),
  })
  .optional();

// Paso: Adjunto
export const enrollmentAttachmentSchema = z.object({
  id: z.string(),
  attachmentType: z.enum(ENROLLMENT_DOCUMENT_TYPE),
  originalFileName: z.string(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  url: z.string().optional(),
  createdAt: z.string().optional(),
});

// Schema para guardar borrador (permite campos incompletos durante el autoguardado)
export const updateEnrollmentDraftSchema = z.object({
  data: z.object({
    academicBackground: z
      .object({
        secondarySchool: z.string().max(255).optional(),
        schoolOrigin: z.string().max(255).optional(),
        currentGradeYear: z.string().max(50).optional(),
        secondaryCompleted: z.boolean().optional(),
        secondaryDegreeTitle: z.string().max(255).optional(),
      })
      .optional(),
    healthInclusion: z.object({ receivesReasonableAdjustments: z.boolean().optional(), adjustmentDetails: z.string().optional() }).optional(),
    responsible: responsibleSchema.partial().optional(),
    preference: z
      .object({
        preferredShift: z.string().max(50).optional(),
        allowsImageUse: z.boolean().optional(),
        isReenrolling: z.boolean().optional(),
        previousTeacher: z.string().max(255).optional(),
      })
      .optional(),
    careerSelection: z.object({ trainingPathId: z.uuid().optional() }).optional(),
    academicSpaceSelection: z.object({ studyPlanSpaceIds: z.array(z.uuid()).optional() }).optional(),
    instrumentSelection: z.object({ studyPlanSpaceInstrumentIds: z.record(z.uuid(), z.uuid()).optional() }).optional(),
  }),
});

// Schema completo y estricto para Enviar Inscripción (valida los pasos y reglas condicionales)
export const enrollmentApplicationSubmissionSchema = z
  .object({
    personalData: personalDataSchema,
    academicBackground: academicBackgroundSchema,
    healthInclusion: healthInclusionSchema,
    responsible: responsibleSchema,
    careerSelection: careerSelectionSchema,
    academicSpaceSelection: academicSpaceSelectionSchema,
    instrumentSelection: instrumentSelectionSchema,
    preference: preferenceSchema,
    attachments: z.array(enrollmentAttachmentSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // 1. Condicional: Si edad < 18, tutor legal obligatorio
    const age = calculateAge(data.personalData.birthDate);

    if (age !== null && age < 18) {
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
