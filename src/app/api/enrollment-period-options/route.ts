import { z } from "zod";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
export async function GET(request: Request): Promise<Response> {
  const parsed = z
    .object({
      trainingPathId: z.uuid(),
      search: z.string().trim().max(100).default(""),
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce.number().int().min(1).max(50).default(20),
    })
    .safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return Response.json({ message: ENROLLMENT_MESSAGES.PERIOD_INPUT_INVALID }, { status: 400 });
  }
  const params = new URLSearchParams({
    trainingPathId: parsed.data.trainingPathId,
    page: String(parsed.data.page),
    size: String(parsed.data.size),
    sort: "startDate,asc",
    search: parsed.data.search,
  });
  try {
    return createPassthroughResponse(
      await institutionalApiFetch(`/api/v1/enrollment-applications/options/periods?${params}`, { signal: request.signal }),
    );
  } catch {
    return Response.json({ message: ENROLLMENT_MESSAGES.PERIOD_FETCH_FAILED }, { status: 503 });
  }
}
