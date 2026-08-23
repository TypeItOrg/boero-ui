import { createAuthRequestHeaders } from "@common/utils/auth-request-headers.util";

describe("createAuthRequestHeaders", () => {
  it("forwards only the trusted client metadata", () => {
    const requestHeaders = new Headers({
      authorization: "Bearer secret",
      cookie: "session=secret",
      "user-agent": "Mozilla/5.0",
      "x-forwarded-for": "198.51.100.10, 172.18.0.1",
      "x-real-ip": "203.0.113.20",
    });

    expect(createAuthRequestHeaders(requestHeaders)).toEqual({
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      "X-Forwarded-For": "203.0.113.20",
      "X-Real-IP": "203.0.113.20",
    });
  });

  it("uses the first forwarded address when the real IP header is absent", () => {
    const requestHeaders = new Headers({ "x-forwarded-for": "198.51.100.10, 172.18.0.1" });

    expect(createAuthRequestHeaders(requestHeaders)).toEqual({
      "Content-Type": "application/json",
      "X-Forwarded-For": "198.51.100.10",
      "X-Real-IP": "198.51.100.10",
    });
  });
});
