import { getContextualSearchShortcutPlatform } from "@features/contextual-search/utils/contextual-search-shortcut-platform.util";

describe("contextual search shortcut platform", () => {
  it("detects macOS from the user agent", () => {
    expect(
      getContextualSearchShortcutPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      ),
    ).toBe("mac");
  });

  it.each([
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  ])("detects ios devices from the user agent", (userAgent) => {
    expect(getContextualSearchShortcutPlatform(userAgent)).toBe("mac");
  });

  it.each([
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
  ])("falls back to windows for non-apple platforms", (userAgent) => {
    expect(getContextualSearchShortcutPlatform(userAgent)).toBe("windows");
  });

  it("falls back to windows when the user agent is missing", () => {
    expect(getContextualSearchShortcutPlatform(null)).toBe("windows");
  });
});
