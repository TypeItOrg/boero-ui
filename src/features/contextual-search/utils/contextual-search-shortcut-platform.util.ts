import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";

const MAC_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/i;

export function getContextualSearchShortcutPlatform(userAgent: string | null): ContextualSearchShortcutPlatform {
  return userAgent !== null && MAC_PLATFORM_PATTERN.test(userAgent) ? "mac" : "windows";
}
