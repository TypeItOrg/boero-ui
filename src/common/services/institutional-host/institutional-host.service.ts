import { cache } from "react";

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { classifyInstitutionalHost } from "@common/services/institutional-host/classify-institutional-host.util";
import { InstitutionalHostError } from "@common/services/institutional-host/institutional-host-error";
import { InstitutionalHostKind } from "@common/services/institutional-host/institutional-host-kind.types";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { isValidUuid } from "@common/utils/uuid.util";

import { INSTITUTIONAL_LOGIN_PATH } from "@features/institutional-auth/utils/institutional-auth-proxy-policy.util";
import type { PublicInstitution } from "@features/institutions/types/public-institution.types";

export const INSTITUTIONAL_HOST_HEADER = "X-Institutional-Host";

export function requireGenericPlatformHost(requestHeaders: Pick<Headers, "get">): void {
  if (!process.env.INSTITUTIONAL_BASE_DOMAIN?.trim()) {
    return;
  }

  if (classifyInstitutionalHost(requestHeaders.get("host")).kind !== InstitutionalHostKind.GENERIC) {
    redirect(INSTITUTIONAL_LOGIN_PATH);
  }
}

export function rebuildInstitutionalHostHeader(outgoing: Headers, requestHeaders: Pick<Headers, "get">): void {
  outgoing.delete(INSTITUTIONAL_HOST_HEADER);

  const context = classifyInstitutionalHost(requestHeaders.get("host"));

  if (context.kind === InstitutionalHostKind.INVALID) {
    throw new InstitutionalHostError(404);
  }

  // Generic is an explicit trusted origin context too, not a tenant selection.
  outgoing.set(INSTITUTIONAL_HOST_HEADER, context.hostname);
}

// A React request cache only: never retain a tenant across requests or processes.
export const getRequestInstitution = cache(async (): Promise<PublicInstitution | undefined> => {
  return resolveRequestInstitution(await headers());
});

export async function resolveRequestInstitution(requestHeaders: Pick<Headers, "get">): Promise<PublicInstitution | undefined> {
  const context = classifyInstitutionalHost(requestHeaders.get("host"));

  if (context.kind === InstitutionalHostKind.INVALID) {
    throw new InstitutionalHostError(404);
  }

  if (context.kind === InstitutionalHostKind.GENERIC) {
    return undefined;
  }

  let response: Response;

  try {
    response = await fetch(new URL(`/api/v1/institutions/by-subdomain/${context.publicSubdomain}`, getApiUrlOrThrow()), {
      headers: { Accept: "application/json", [INSTITUTIONAL_HOST_HEADER]: context.hostname },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new InstitutionalHostError(503);
  }

  if (response.status === 404) {
    throw new InstitutionalHostError(404);
  }

  if (!response.ok) {
    throw new InstitutionalHostError(503);
  }

  try {
    const institution = (await response.json()) as PublicInstitution;

    if (
      !isValidUuid(institution.id) ||
      typeof institution.name !== "string" ||
      !institution.name.trim() ||
      institution.publicSubdomain !== context.publicSubdomain ||
      (institution.logoUrl !== null && typeof institution.logoUrl !== "string")
    ) {
      throw new Error("Invalid institution payload");
    }

    return {
      id: institution.id,
      name: institution.name,
      publicSubdomain: institution.publicSubdomain,
      logoUrl: institution.logoUrl,
    };
  } catch {
    throw new InstitutionalHostError(503);
  }
}

export async function validateRequestInstitutionId(institutionId: string): Promise<string | undefined> {
  try {
    const institution = await getRequestInstitution();

    if (institution && institution.id !== institutionId) {
      return "La institución no corresponde a este acceso.";
    }

    return undefined;
  } catch (error) {
    return error instanceof InstitutionalHostError ? error.message : "No se pudo validar la institución. Intentá nuevamente.";
  }
}
