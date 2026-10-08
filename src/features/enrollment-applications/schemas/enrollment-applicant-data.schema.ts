import { z } from "zod";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

// Paso 1: Datos Personales y Contacto
export const personalDataSchema = z.object({
  firstName: z.string().trim().min(1, ENROLLMENT_MESSAGES.NAME_REQUIRED),
  lastName: z.string().trim().min(1, ENROLLMENT_MESSAGES.LAST_NAME_REQUIRED),
  documentNumber: z.string().trim().min(1, ENROLLMENT_MESSAGES.DOCUMENT_REQUIRED),
  birthDate: z.string({ error: ENROLLMENT_MESSAGES.BIRTH_DATE_REQUIRED }).trim().min(1, ENROLLMENT_MESSAGES.BIRTH_DATE_REQUIRED),
  phoneNumber: z.string().trim().nullish(),
  email: z.string().trim().min(1, ENROLLMENT_MESSAGES.EMAIL_REQUIRED).email(ENROLLMENT_MESSAGES.EMAIL_INVALID),
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
