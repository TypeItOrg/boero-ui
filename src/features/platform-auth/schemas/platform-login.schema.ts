import { z } from "zod";
import { PLATFORM_AUTH_ERROR_MESSAGES } from "@features/platform-auth/constants/error-messages.constants";

export const platformLoginSchema = z.object({
  email: z
    .string()
    .min(1, { message: PLATFORM_AUTH_ERROR_MESSAGES.REQUIRED_EMAIL, abort: true })
    .check(z.email({ message: PLATFORM_AUTH_ERROR_MESSAGES.INVALID_EMAIL })),
  password: z.string().min(1, PLATFORM_AUTH_ERROR_MESSAGES.REQUIRED_PASSWORD),
});
