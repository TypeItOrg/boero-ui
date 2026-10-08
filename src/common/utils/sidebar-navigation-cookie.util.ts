import type { SidebarNavigationGroupStates } from "@common/types/sidebar-navigation-group-states.types";

export function parseSidebarNavigationGroupStates(value: string | undefined): SidebarNavigationGroupStates {
  if (!value) {
    return {};
  }

  try {
    const states: unknown = JSON.parse(decodeURIComponent(value));

    if (typeof states !== "object" || states === null || Array.isArray(states)) {
      return {};
    }

    return Object.fromEntries(Object.entries(states).filter((entry): entry is [string, boolean] => typeof entry[1] === "boolean"));
  } catch {
    return {};
  }
}
