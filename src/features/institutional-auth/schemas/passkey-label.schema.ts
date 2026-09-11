import { z } from "zod";

export const passkeyLabelSchema = z.object({
  label: z.string().trim().min(1, "El nombre es requerido.").max(100, "El nombre debe tener entre 1 y 100 caracteres."),
});
