import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicOfferDetail } from "@features/academic-offers/types/academic-offer-detail.types";
import type { AcademicOfferSummary } from "@features/academic-offers/types/academic-offer-summary.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const FETCH_ERROR = "No se pudo obtener la oferta académica.";

export async function fetchAcademicOffers(
  institutionId: string,
  params: { page?: number; size?: number } = {},
): Promise<PaginatedResponse<AcademicOfferSummary>> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.size !== undefined) searchParams.set("size", String(params.size));
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/academic-offers${query}`);

  return parseHttpResponse(response, FETCH_ERROR);
}

export async function fetchAcademicOffer(institutionId: string, studyPlanId: string): Promise<AcademicOfferDetail | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/academic-offers/${studyPlanId}`);

  return parseNullableHttpResponse(response, FETCH_ERROR);
}
