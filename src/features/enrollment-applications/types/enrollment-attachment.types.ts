export interface EnrollmentAttachment {
  id: string;
  requirementId: string;
  originalFileName: string;
  contentType?: string;
  size?: number;
  url?: string;
  createdAt?: string;
}
