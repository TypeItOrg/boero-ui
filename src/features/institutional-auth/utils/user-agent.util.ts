export type ParsedUserAgent = {
  browser: string;
  platform: string;
};

const UNKNOWN_LABEL = "Desconocido";

const BROWSER_PATTERNS: readonly [RegExp, string][] = [
  [/Edg(?:e|A|iOS)?\//, "Microsoft Edge"],
  [/(?:OPR|Opera)\//, "Opera"],
  [/\bFirefox\//, "Firefox"],
  [/\b(?:HeadlessChrome|Chrome|CriOS)\//, "Google Chrome"],
  [/\bVersion\/.*\bSafari\//, "Safari"],
];

const PLATFORM_PATTERNS: readonly [RegExp, string][] = [
  [/Windows NT/, "Windows"],
  [/\bCrOS\b/, "ChromeOS"],
  [/(?:iPhone|iPad|iPod)/, "iOS"],
  [/\bAndroid\b/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/\bLinux\b|\bX11\b/, "Linux"],
];

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  if (!userAgent.trim()) return { browser: UNKNOWN_LABEL, platform: UNKNOWN_LABEL };

  const browser = BROWSER_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? UNKNOWN_LABEL;
  const platform = PLATFORM_PATTERNS.find(([pattern]) => pattern.test(userAgent))?.[1] ?? UNKNOWN_LABEL;

  return { browser, platform };
}

export function formatUserAgentLabel(userAgent: string): string {
  const { browser, platform } = parseUserAgent(userAgent);
  if (browser === UNKNOWN_LABEL && platform === UNKNOWN_LABEL) return UNKNOWN_LABEL;

  return `${browser} · ${platform}`;
}
