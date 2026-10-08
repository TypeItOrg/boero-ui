import { z } from "zod";

import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function GET(request: Request): Promise<Response> {
  const input = z
    .object({
      institutionId: z.uuid().optional(),
      page: z.coerce.number().int().min(0).default(0),
      size: z.coerce
        .number()
        .refine((value) => PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number]))
        .default(20),
      search: z.string().max(150).default(""),
      active: z.enum(["true", "false"]).optional(),
    })
    .safeParse(Object.fromEntries(new URL(request.url).searchParams));

  if (!input.success) {
    return Response.json({ message: "Revisá los filtros." }, { status: 400 });
  }

  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(input.data)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }

  try {
    const response = await platformApiFetch(`/api/v1/admin/document-definitions?${query}`, {
      signal: request.signal,
    });

    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "No se pudo consultar la documentación. Intentá nuevamente." }, { status: 503 });
  }
}
