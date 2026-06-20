import { z } from "zod";

export const platformLoginSchema = z.object({
  email: z.email("Ingresá un correo válido."),
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export type PlatformLoginActionState = {
  error?: string;
  errors?: string[];
  fields?: Array<"email" | "password">;
};
