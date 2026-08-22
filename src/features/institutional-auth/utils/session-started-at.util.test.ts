import { formatSessionStartedAt } from "@features/institutional-auth/utils/session-started-at.util";

describe("formatSessionStartedAt", () => {
  it("interprets offset-less backend values as UTC and renders Argentine time", () => {
    expect(formatSessionStartedAt("2026-08-22T01:06:00")).toBe("21/08/2026, 22:06");
  });

  it("drops seconds", () => {
    expect(formatSessionStartedAt("2026-08-21T19:06:45")).toBe("21/08/2026, 16:06");
  });

  it("respects values that already carry an explicit offset", () => {
    expect(formatSessionStartedAt("2026-08-21T19:06:00-03:00")).toBe("21/08/2026, 19:06");
  });

  it("returns the raw value when it is not an expected datetime", () => {
    expect(formatSessionStartedAt("fecha inválida")).toBe("fecha inválida");
  });
});
