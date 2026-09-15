import { z } from "zod";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

export const rejectionReasonSchema = z.object({
  rejectionReason: z.string().trim().min(1, ENROLLMENT_MESSAGES.INVALID_REJECTION_REASON).max(1000, ENROLLMENT_MESSAGES.REJECTION_TOO_LONG),
});
