import { z } from "zod";

export const platformLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "El correo es requerido.", abort: true })
    .check(z.email({ message: "Ingresá un correo válido." })),
  password: z.string().min(1, "La contraseña es requerida."),
});
