import type { EnrollmentDocumentType } from "@features/enrollment-applications/types/enrollment-document-type.types";

export interface EnrollmentAttachment {
  id: string;
  attachmentType: EnrollmentDocumentType;
  originalFileName: string;
  contentType?: string;
  size?: number;
  url?: string;
  createdAt?: string;
}
