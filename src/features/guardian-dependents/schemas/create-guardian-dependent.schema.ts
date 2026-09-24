import { z } from "zod";

import { GUARDIAN_DEPENDENT_MESSAGES } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { GUARDIAN_RELATIONSHIP } from "@features/guardian-dependents/types/guardian-relationship.types";
import { hasMinimumPersonAge, isMinorBirthDate } from "@features/people/utils/person-birth-date.util";

export const createGuardianDependentSchema = z.object({
  documentNumber: z
    .string()
    .min(1, { message: GUARDIAN_DEPENDENT_MESSAGES.REQUIRED_DOCUMENT, abort: true })
    .regex(/^\d{8}$/, GUARDIAN_DEPENDENT_MESSAGES.INVALID_DOCUMENT),
  firstName: z
    .string()
    .trim()
    .min(1, { message: GUARDIAN_DEPENDENT_MESSAGES.REQUIRED_NAME, abort: true })
    .min(3, GUARDIAN_DEPENDENT_MESSAGES.INVALID_NAME)
    .max(255, GUARDIAN_DEPENDENT_MESSAGES.INVALID_NAME)
    .regex(/^[\p{L} ]+$/u, GUARDIAN_DEPENDENT_MESSAGES.INVALID_NAME),
  lastName: z
    .string()
    .trim()
    .min(1, { message: GUARDIAN_DEPENDENT_MESSAGES.REQUIRED_LAST_NAME, abort: true })
    .min(3, GUARDIAN_DEPENDENT_MESSAGES.INVALID_LAST_NAME)
    .max(255, GUARDIAN_DEPENDENT_MESSAGES.INVALID_LAST_NAME)
    .regex(/^[\p{L} ]+$/u, GUARDIAN_DEPENDENT_MESSAGES.INVALID_LAST_NAME),
  birthDate: z
    .string()
    .min(1, { message: GUARDIAN_DEPENDENT_MESSAGES.REQUIRED_BIRTH_DATE, abort: true })
    .refine(hasMinimumPersonAge, GUARDIAN_DEPENDENT_MESSAGES.INVALID_BIRTH_DATE)
    .refine(isMinorBirthDate, GUARDIAN_DEPENDENT_MESSAGES.DEPENDENT_MUST_BE_MINOR),
  relationship: z.enum(Object.values(GUARDIAN_RELATIONSHIP) as [string, ...string[]], GUARDIAN_DEPENDENT_MESSAGES.INVALID_RELATIONSHIP),
  // Raw form value: it must be explicit, a missing value is invalid rather than an implicit false.
  isPrimaryContact: z.enum(["true", "false"], GUARDIAN_DEPENDENT_MESSAGES.INVALID_PRIMARY_CONTACT).transform((value) => value === "true"),
});
