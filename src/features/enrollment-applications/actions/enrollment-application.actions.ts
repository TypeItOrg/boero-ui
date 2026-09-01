"use server";

import { startOrGetEnrollmentApplication, updateEnrollmentDraft } from "../services/enrollment-application.service";
import type {
  EnrollmentApplicationResponse,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";

export async function startOrGetEnrollmentApplicationAction(input: StartEnrollmentApplicationInput): Promise<EnrollmentApplicationResponse> {
  return startOrGetEnrollmentApplication(input);
}

export async function updateEnrollmentDraftAction(applicationId: string, input: UpdateEnrollmentDraftInput): Promise<EnrollmentApplicationResponse> {
  return updateEnrollmentDraft(applicationId, input);
}
