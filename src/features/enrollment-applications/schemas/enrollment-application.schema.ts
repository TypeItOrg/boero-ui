import { z } from "zod";

export function calculateAge(birthDate: string | Date | undefined): number | null {
  if (!birthDate) return null;
  const date = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  if (isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

export const startEnrollmentApplicationSchema = z.object({
  studyPlanId: z.string().uuid("El plan de estudio debe ser un UUID válido"),
  academicYearId: z.string().uuid("El ciclo lectivo debe ser un UUID válido"),
});

// Paso 1: Datos Personales y Contacto
export const personalDataSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio"),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  documentNumber: z.string().trim().min(1, "El número de documento es obligatorio"),
  birthDate: z.string().trim().min(1, "La fecha de nacimiento es obligatoria"),
  phoneNumber: z.string().trim().min(1, "El teléfono de contacto es obligatorio"),
  email: z.string().trim().min(1, "El correo electrónico es obligatorio").email("El correo electrónico no es válido"),
});

// Paso 2: Escolaridad de Base
export const academicBackgroundSchema = z.object({
  secondarySchool: z.string().trim().min(1, "El colegio de origen es obligatorio"),
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
  preferredShift: z.string().trim().min(1, "Debe seleccionar un turno preferente"),
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
  attachmentType: z.enum(["DNI_FRONT", "DNI_BACK", "SECONDARY_CERTIFICATE", "HEALTH_REPORT", "PHOTO_ID"]),
  originalFileName: z.string(),
  contentType: z.string().optional(),
  size: z.number().optional(),
  url: z.string().optional(),
  createdAt: z.string().optional(),
});

// Schema para guardar borrador (permite campos incompletos durante el autoguardado)
export const updateEnrollmentDraftSchema = z.object({
  data: z.record(z.string(), z.unknown()),
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
          message: "El nombre y apellido del responsable es obligatorio para menores de 18 años",
          path: ["responsible", "fullName"],
        });
      }
      if (!resp?.documentNumber || resp.documentNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El DNI del responsable es obligatorio para menores de 18 años",
          path: ["responsible", "documentNumber"],
        });
      }
      if (!resp?.phoneNumber || resp.phoneNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El teléfono del responsable es obligatorio para menores de 18 años",
          path: ["responsible", "phoneNumber"],
        });
      }
      if (!resp?.email || resp.email.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El correo electrónico del responsable es obligatorio para menores de 18 años",
          path: ["responsible", "email"],
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resp.email.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El correo electrónico del responsable no es válido",
          path: ["responsible", "email"],
        });
      }
      if (!resp?.occupation || resp.occupation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La ocupación del responsable es obligatoria para menores de 18 años",
          path: ["responsible", "occupation"],
        });
      }
      if (!resp?.educationLevel || resp.educationLevel.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El nivel de instrucción del responsable es obligatorio para menores de 18 años",
          path: ["responsible", "educationLevel"],
        });
      }
    }

    // 2. Condicional: Si recibe ajustes razonables, detalle e informe de salud obligatorios
    if (data.healthInclusion.receivesReasonableAdjustments) {
      if (!data.healthInclusion.adjustmentDetails || data.healthInclusion.adjustmentDetails.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe describir los ajustes razonables que requiere",
          path: ["healthInclusion", "adjustmentDetails"],
        });
      }
    }

    // 3. Condicional: Si es reingresante, docente previo obligatorio
    if (data.preference.isReenrolling) {
      if (!data.preference.previousTeacher || data.preference.previousTeacher.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe indicar el docente previo al ser estudiante reingresante",
          path: ["preference", "previousTeacher"],
        });
      }
    }
  });

export type EnrollmentApplicationSubmissionInput = z.infer<typeof enrollmentApplicationSubmissionSchema>;
