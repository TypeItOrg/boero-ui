import { z } from "zod";

import { parseDateInput } from "@common/utils/date-input.util";

export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const optionalDate = z
  .string()
  .refine((value) => !value || parseDateInput(value) !== undefined, "Ingresá una fecha válida.")
  .transform((value) => value || null);

export const name = z.string().trim().min(1, "Ingresá un nombre.").max(150, "El nombre no puede superar los 150 caracteres.");

export const positiveOrder = z.coerce.number().int().min(1, "El orden debe ser positivo.");

export const activeSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .optional()
  .transform((val) => (val === undefined ? undefined : val === true || val === "true"));

export const optionalUuid = z
  .string()
  .trim()
  .refine((value) => value === "" || z.uuid().safeParse(value).success, "Seleccioná un valor válido.")
  .transform((value) => value || null);

export const checkboxSchema = z.enum(["true", "false"]).transform((value) => value === "true");

export function isValidDateRange(start: string | null | undefined, end: string | null | undefined): boolean {
  return !start || !end || end >= start;
}
