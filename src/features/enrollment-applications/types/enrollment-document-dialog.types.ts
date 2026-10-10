import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export type EnrollmentDocumentDialog =
  | { kind: "request" }
  | { kind: "edit"; requirement: DocumentRequirement; operation: "review" | "withdraw" }
  | { kind: "activity"; requirement: DocumentRequirement; initialTab: "deliveries" | "changes" }
  | null;
