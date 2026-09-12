import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

export function getApplicantFullName(application: EnrollmentApplicationResponse): string {
  if (application.applicantName?.trim()) {
    return application.applicantName.trim();
  }

  const personal = application.data?.personalData;
  if (personal?.firstName || personal?.lastName) {
    const full = `${personal.firstName ?? ""} ${personal.lastName ?? ""}`.trim();
    if (full.length > 0) return full;
  }

  return "Sin nombre registrado";
}

export function getApplicantDni(application: EnrollmentApplicationResponse): string {
  if (application.applicantDocumentNumber?.trim()) {
    return application.applicantDocumentNumber.trim();
  }

  const personal = application.data?.personalData;
  if (personal?.documentNumber?.trim()) {
    return personal.documentNumber.trim();
  }

  return "—";
}

export function formatApplicationDate(dateStr?: string | null): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatApplicationDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export function formatBirthDate(dateStr?: string | null): string {
  if (!dateStr) return "—";

  // Handle YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (year && month && day) {
      return `${day.slice(0, 2)}/${month}/${year}`;
    }
  }

  return formatApplicationDate(dateStr);
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getAttachmentDownloadUrl(applicationId: string, attachmentId: string): string {
  return `/api/enrollment-applications/${applicationId}/attachments/${attachmentId}/content`;
}
