import { z } from "zod";

import { LOCATION_ERROR_MESSAGES } from "@features/locations/constants/error-messages.constants";
import { proxyLocationGet } from "@features/locations/services/proxy-location-get.service";

type ProvinceCitiesContext = {
  params: Promise<{ provinceId: string }>;
};

export async function GET(request: Request, { params }: ProvinceCitiesContext): Promise<Response> {
  const parsedProvinceId = z.uuid().safeParse((await params).provinceId);
  if (!parsedProvinceId.success) {
    return Response.json({ message: LOCATION_ERROR_MESSAGES.INVALID_LOCATION_ID }, { status: 400 });
  }

  return proxyLocationGet(request, `/api/v1/provinces/${parsedProvinceId.data}/cities`);
}
