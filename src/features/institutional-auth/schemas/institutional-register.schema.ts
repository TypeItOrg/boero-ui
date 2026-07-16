import { z } from "zod";
import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";

export const institutionalRegisterSchema = z.object({
  email: z
    .string()
    .min(1, { message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_EMAIL, abort: true })
    .check(z.email({ message: INSTITUTIONAL_AUTH_ERROR_MESSAGES.INVALID_EMAIL })),
  password: z.string().min(1, INSTITUTIONAL_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
});
