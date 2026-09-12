import type { FieldActionState } from "@common/utils/action-state.util";

export type EmailVerificationState = FieldActionState<"institutionId" | "documentNumber" | "password" | "email" | "token">;
