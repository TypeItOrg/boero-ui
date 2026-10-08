import "server-only";

import { headers as getRequestHeaders } from "next/headers";

import { INSTITUTIONAL_HOST_HEADER, rebuildInstitutionalHostHeader } from "@common/services/institutional-host/institutional-host.service";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";

export async function publicApiFetch(path: string, init: RequestInit = {}, requestHeaders?: Pick<Headers, "get">): Promise<Response> {
  const outgoing = new Headers(init.headers);

  outgoing.delete(INSTITUTIONAL_HOST_HEADER);

  if (!outgoing.has("Accept")) {
    outgoing.set("Accept", "application/json");
  }

  // Disabled branded mode preserves local development. Proxy still validates the public Host.
  if (process.env.INSTITUTIONAL_BASE_DOMAIN?.trim()) {
    rebuildInstitutionalHostHeader(outgoing, requestHeaders ?? (await getRequestHeaders()));
  }

  const timeoutSignal = AbortSignal.timeout(15_000);

  const signal = init.signal ? AbortSignal.any([init.signal, timeoutSignal]) : timeoutSignal;

  return fetch(new URL(path, getApiUrlOrThrow()), {
    ...init,
    cache: "no-store",
    headers: outgoing,
    signal,
  });
}
