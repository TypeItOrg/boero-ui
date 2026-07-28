import { proxyLocationGet } from "@features/locations/services/proxy-location-get.service";

export async function GET(request: Request): Promise<Response> {
  return proxyLocationGet(request, "/api/v1/countries");
}
