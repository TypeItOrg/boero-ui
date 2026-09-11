import { z } from "zod";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export const institutionalPasswordLoginSchema = z.object({
  loginAttemptId: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_FORM),
  password: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
  rememberMe: z.boolean(),
});
