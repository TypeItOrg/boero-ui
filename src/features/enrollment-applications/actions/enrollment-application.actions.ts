"use server";

import {
  startOrGetEnrollmentApplication,
  getEnrollmentApplication,
  updateEnrollmentDraft,
  submitEnrollmentApplication,
  cancelEnrollmentApplication,
  uploadEnrollmentAttachment,
  deleteEnrollmentAttachment,
  fetchEnrollmentApplications,
  fetchEnrollmentApplicationById,
} from "../services/enrollment-application.service";
import type {
  EnrollmentApplicationResponse,
  EnrollmentAttachment,
  EnrollmentDocumentType,
  FetchEnrollmentApplicationsParams,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

export async function fetchEnrollmentApplicationsAction(
  params?: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplicationResponse>> {
  return fetchEnrollmentApplications(params);
}

export async function fetchEnrollmentApplicationByIdAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return fetchEnrollmentApplicationById(applicationId);
}

export async function startOrGetEnrollmentApplicationAction(input: StartEnrollmentApplicationInput): Promise<EnrollmentApplicationResponse> {
  return startOrGetEnrollmentApplication(input);
}

export async function getEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return getEnrollmentApplication(applicationId);
}

export async function updateEnrollmentDraftAction(applicationId: string, input: UpdateEnrollmentDraftInput): Promise<EnrollmentApplicationResponse> {
  return updateEnrollmentDraft(applicationId, input);
}

export async function submitEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return submitEnrollmentApplication(applicationId);
}

export async function cancelEnrollmentApplicationAction(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return cancelEnrollmentApplication(applicationId);
}

export async function uploadEnrollmentAttachmentAction(applicationId: string, formData: FormData): Promise<EnrollmentAttachment> {
  const file = formData.get("file") as File;
  const documentType = formData.get("documentType") as EnrollmentDocumentType;
  if (!file) {
    throw new Error("No se ha seleccionado ningún archivo");
  }
  return uploadEnrollmentAttachment(applicationId, documentType, file);
}

export async function deleteEnrollmentAttachmentAction(applicationId: string, attachmentId: string): Promise<void> {
  return deleteEnrollmentAttachment(applicationId, attachmentId);
}
