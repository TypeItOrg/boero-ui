import { z } from "zod";

import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import { proxyLocationGet } from "@features/locations/services/proxy-location-get.service";

type CountryProvincesContext = {
  params: Promise<{ countryId: string }>;
};

export async function GET(request: Request, { params }: CountryProvincesContext): Promise<Response> {
  const parsedCountryId = z.uuid().safeParse((await params).countryId);
  if (!parsedCountryId.success) {
    return Response.json({ message: LOCATION_ERROR_MESSAGES.INVALID_LOCATION_ID }, { status: 400 });
  }

  return proxyLocationGet(request, `/api/v1/countries/${parsedCountryId.data}/provinces`);
}
