import { readFileSync } from "node:fs";
import { z } from "zod";
import type { AcceptanceFixture } from "./acceptance-fixture.types";
import type { AcceptanceStack } from "./acceptance-stack.types";
import type { AcceptanceTenant } from "./acceptance-tenant.types";

const tenant = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  publicSubdomain: z.string().regex(/^[a-z0-9-]+$/),
  document: z.string().regex(/^\d{8}$/),
  password: z.string().min(8),
  email: z.email(),
  userId: z.uuid(),
  personId: z.uuid(),
});
const stack = z.object({
  publicBase: z.url(),
  apiBase: z.url(),
  mailBase: z.url(),
  admin: z.object({ email: z.email(), password: z.string().min(8) }),
  tenantA: tenant,
  tenantB: tenant,
});
const schema = z.object({ namespace: z.string().regex(/^boero-acceptance-[a-z0-9-]+$/), stacks: z.object({ qa: stack, staging: stack }) });

export function loadAcceptanceFixture(): AcceptanceFixture {
  const path = process.env.ACCEPTANCE_FIXTURE;
  if (!path) {
    throw new Error("Private disposable acceptance fixture is required.");
  }

  let data: unknown;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error("Cannot read private acceptance fixture.");
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    // Never include Zod's raw input/errors: the fixture contains secrets.
    throw new Error("Acceptance fixture shape is invalid.");
  }

  for (const [environment, value] of Object.entries(parsed.data.stacks)) {
    for (const loopbackBase of [value.apiBase, value.mailBase]) {
      const url = new URL(loopbackBase);
      if (
        url.protocol !== "http:" ||
        url.hostname !== "127.0.0.1" ||
        url.username ||
        url.password ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
      ) {
        throw new Error("Acceptance API and mail targets must be loopback-only origins.");
      }
    }
    value.apiBase = new URL(value.apiBase).origin;
    value.mailBase = new URL(value.mailBase).origin;
    const publicUrl = new URL(value.publicBase);
    const expectedHost = environment === "qa" ? "testing.typeit.com.ar" : "staging.typeit.com.ar";
    if (
      publicUrl.protocol !== "https:" ||
      publicUrl.hostname !== expectedHost ||
      publicUrl.username ||
      publicUrl.password ||
      publicUrl.pathname !== "/" ||
      publicUrl.search ||
      publicUrl.hash
    ) {
      throw new Error("Acceptance browser target is not the approved local HTTPS simulation.");
    }
    value.publicBase = publicUrl.origin;
  }
  return parsed.data;
}

export function tenantPublicBase(stack: AcceptanceStack, institution: AcceptanceTenant): string {
  const url = new URL(stack.publicBase);
  url.hostname = `${institution.publicSubdomain}.${url.hostname}`;
  return url.origin;
}

export function tenantHeader(stack: AcceptanceStack, institution: AcceptanceTenant): Record<string, string> {
  return { "X-Institutional-Host": new URL(tenantPublicBase(stack, institution)).hostname };
}
