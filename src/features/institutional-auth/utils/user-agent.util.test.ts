import { formatUserAgentLabel, parseUserAgent } from "@features/institutional-auth/utils/user-agent.util";

describe("parseUserAgent", () => {
  it.each([
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      { browser: "Google Chrome", platform: "Windows" },
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
      { browser: "Safari", platform: "macOS" },
    ],
    ["Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0", { browser: "Firefox", platform: "Linux" }],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
      { browser: "Microsoft Edge", platform: "Windows" },
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
      { browser: "Safari", platform: "iOS" },
    ],
    ["node", { browser: "Desconocido", platform: "Desconocido" }],
  ])("parses %s", (userAgent, expected) => {
    expect(parseUserAgent(userAgent)).toEqual(expected);
  });

  it("formats a friendly label joining browser and platform", () => {
    expect(
      formatUserAgentLabel("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"),
    ).toBe("Google Chrome · Windows");
  });

  it("falls back to the unknown label for empty or unrecognized agents", () => {
    expect(formatUserAgentLabel("")).toBe("Desconocido");
    expect(formatUserAgentLabel("   ")).toBe("Desconocido");
    expect(formatUserAgentLabel("node")).toBe("Desconocido");
  });
});
