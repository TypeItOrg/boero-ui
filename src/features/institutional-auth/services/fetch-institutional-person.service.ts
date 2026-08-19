import "server-only";

import { cache } from "react";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { InstitutionalPerson } from "@features/institutional-auth/types/institutional-person.types";

const FALLBACK_MESSAGE = "No se pudieron obtener tus datos personales.";

async function getInstitutionalPerson(): Promise<InstitutionalPerson | null> {
  const response = await institutionalApiFetch("/api/v1/person/me");
  if (response.status === 401 || response.status === 403 || response.status === 404) return null;

  return parseHttpResponse(response, FALLBACK_MESSAGE);
}

export const fetchInstitutionalPerson = cache(getInstitutionalPerson);
