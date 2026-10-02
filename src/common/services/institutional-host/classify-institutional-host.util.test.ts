import { classifyInstitutionalHost } from "@common/services/institutional-host/classify-institutional-host.util";
import { InstitutionalHostKind } from "@common/services/institutional-host/institutional-host-kind.types";

const canonical = "https://testing.typeit.com.ar";
const domain = "testing.typeit.com.ar";

describe("institutional host classification", () => {
  it.each(["testing.typeit.com.ar", "TESTING.TYPEIT.COM.AR"])("keeps selector on canonical generic %s", (host) => {
    expect(classifyInstitutionalHost(host, canonical, domain).kind).toBe(InstitutionalHostKind.GENERIC);
  });
  it("keeps local development generic with branded access disabled", () => {
    expect(classifyInstitutionalHost("localhost:3000", "http://localhost:3000", "").kind).toBe(InstitutionalHostKind.GENERIC);
    expect(classifyInstitutionalHost("cboero.localhost:3000", "http://localhost:3000", "").kind).toBe(InstitutionalHostKind.GENERIC);
  });
  it.each(["test", "staging"])("resolves one institution label in the %s namespace", (environment) => {
    expect(
      classifyInstitutionalHost(`cboero.${environment}.typeit.com.ar:443`, `https://${environment}.typeit.com.ar`, `${environment}.typeit.com.ar`),
    ).toEqual({ kind: InstitutionalHostKind.INSTITUTIONAL, hostname: `cboero.${environment}.typeit.com.ar`, publicSubdomain: "cboero" });
  });
  it.each([
    null,
    "evil.test",
    "cboero.testing.typeit.com.ar.evil.test",
    "a.b.testing.typeit.com.ar",
    "-a.testing.typeit.com.ar",
    "a-.testing.typeit.com.ar",
    "a_test.testing.typeit.com.ar",
    "https://cboero.testing.typeit.com.ar",
    "a@testing.typeit.com.ar",
    "testing.typeit.com.ar:8080",
    " testing.typeit.com.ar",
    "testing.typeit.com.ar,evil.test",
  ])("rejects unconfigured or malformed authority %s", (host) => {
    expect(classifyInstitutionalHost(host, canonical, domain).kind).toBe(InstitutionalHostKind.INVALID);
  });
});

it.each(["staging.typeit.com.ar", "staging.typeit.com.ar:8443", "127.0.0.1:3000", "localhost:4000", "[::1]:3000"])(
  "[A01.generic-flows] optional mode accepts a syntactically valid legacy Host %s with blank new config",
  (host) => {
    expect(classifyInstitutionalHost(host, "", "").kind).toBe(InstitutionalHostKind.GENERIC);
  },
);
it("[A01.generic-flows] absent new environment keeps existing staging/local generic access", () => {
  const oldUrl = process.env.FRONTEND_PUBLIC_URL;
  const oldDomain = process.env.INSTITUTIONAL_BASE_DOMAIN;
  delete process.env.FRONTEND_PUBLIC_URL;
  delete process.env.INSTITUTIONAL_BASE_DOMAIN;
  try {
    expect(classifyInstitutionalHost("staging.typeit.com.ar").kind).toBe(InstitutionalHostKind.GENERIC);
    expect(classifyInstitutionalHost("127.0.0.1:3000").kind).toBe(InstitutionalHostKind.GENERIC);
  } finally {
    if (oldUrl === undefined) {
      delete process.env.FRONTEND_PUBLIC_URL;
    } else {
      process.env.FRONTEND_PUBLIC_URL = oldUrl;
    }
    if (oldDomain === undefined) {
      delete process.env.INSTITUTIONAL_BASE_DOMAIN;
    } else {
      process.env.INSTITUTIONAL_BASE_DOMAIN = oldDomain;
    }
  }
});
it.each([
  "https://staging.typeit.com.ar",
  "staging.typeit.com.ar/evil",
  "staging.typeit.com.ar,peer",
  "staging.typeit.com.ar:65536",
  "bad_host",
  "user@staging.typeit.com.ar",
  "host%2edomain",
])("[A03.untrusted-header] legacy mode still rejects malformed Host %s", (host) => {
  expect(classifyInstitutionalHost(host, "", "").kind).toBe(InstitutionalHostKind.INVALID);
});
