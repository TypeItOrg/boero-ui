/** Page where the institution reviews the guardianship requests. Server Actions revalidate it. */
export const GUARDIAN_LINKS_PAGE_PATH = "/guardian-links";

export function getGuardianLinksApiPath(institutionId: string): string {
  return `/api/v1/institutions/${institutionId}/guardian-links`;
}

export function getGuardianLinkAttachmentContentPath(linkId: string, attachmentId: string): string {
  return `/api/institutional/guardian-links/${linkId}/attachments/${attachmentId}/content`;
}

export const GUARDIAN_LINK_MESSAGES = {
  FETCH: "No se pudieron cargar las solicitudes de vinculación.",
  FETCH_ATTACHMENTS: "No se pudo cargar la documentación de la solicitud.",
  RESOLVE: "No se pudo resolver la solicitud.",
  FORBIDDEN: "No tenés permisos para validar vinculaciones.",
  DOWNLOAD_FAILED: "No se pudo descargar el documento.",
} as const;
