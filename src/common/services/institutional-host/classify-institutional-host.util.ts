import { InstitutionalHostKind } from "@common/services/institutional-host/institutional-host-kind.types";
import type { InstitutionalHost } from "@common/services/institutional-host/institutional-host.types";

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function classifyInstitutionalHost(
  host: string | null,
  publicUrl = process.env.FRONTEND_PUBLIC_URL || "http://localhost:3000",
  baseDomain = process.env.INSTITUTIONAL_BASE_DOMAIN || "",
): InstitutionalHost {
  if (!host || host !== host.trim() || /[\s/@\\%?#,]/.test(host)) {
    return { kind: InstitutionalHostKind.INVALID };
  }

  try {
    const authority = new URL(`http://${host}`);

    const hostname = authority.hostname.toLowerCase();

    const ipv6 = hostname.startsWith("[") && hostname.endsWith("]");

    if (!hostname || hostname.length > 253 || (!ipv6 && !hostname.split(".").every((label) => LABEL.test(label)))) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    const base = baseDomain.trim().toLowerCase();

    // Optional branded mode must not require new configuration in existing deployments.
    // A syntactically valid old Host remains generic; there is never a branded lookup here.
    if (!base) {
      return { kind: InstitutionalHostKind.GENERIC, hostname };
    }

    if (!base.split(".").every((label) => LABEL.test(label))) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    const canonical = new URL(publicUrl);

    if (!["http:", "https:"].includes(canonical.protocol) || canonical.username || canonical.password) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    const incoming = new URL(`${canonical.protocol}//${host}`);

    if (incoming.port !== canonical.port) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    if (hostname === canonical.hostname.toLowerCase()) {
      return { kind: InstitutionalHostKind.GENERIC, hostname };
    }

    if (!hostname.endsWith(`.${base}`)) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    const publicSubdomain = hostname.slice(0, -(base.length + 1));

    if (!LABEL.test(publicSubdomain)) {
      return { kind: InstitutionalHostKind.INVALID };
    }

    return { kind: InstitutionalHostKind.INSTITUTIONAL, hostname, publicSubdomain };
  } catch {
    return { kind: InstitutionalHostKind.INVALID };
  }
}
