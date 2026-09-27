export interface DocumentDelivery {
  id: string;
  requirementId: string;
  originalFileName: string;
  size: number;
  contentType: string;
  createdAt: string;
  versionStatus: "CURRENT" | "SUPERSEDED" | "WITHDRAWN";
  reviewStatus: "PENDING_REVIEW" | "OBSERVED" | "ACCEPTED";
  uploadedBy: string | null;
  uploaderType: string;
  reviewedBy: string | null;
  reviewerType: string | null;
  reviewedAt: string | null;
  observation: string | null;
  storagePath: null;
}
