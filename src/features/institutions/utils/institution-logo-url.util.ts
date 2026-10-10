import { isValidUuid } from "@common/utils/uuid.util";

export function getInstitutionLogoUrl(institutionId: string, backendLogoUrl: string | null | undefined): string | null {
  if (!isValidUuid(institutionId) || !backendLogoUrl) {
    return null;
  }

  const path = `/api/v1/institutions/${institutionId}/logo`;

  if (backendLogoUrl !== path && !backendLogoUrl.startsWith(`${path}?`)) {
    return null;
  }

  const version = new URL(backendLogoUrl, "http://logo.invalid").searchParams.get("v");

  return `/api/public/institutions/${institutionId}/logo${version ? `?v=${encodeURIComponent(version)}` : ""}`;
}
