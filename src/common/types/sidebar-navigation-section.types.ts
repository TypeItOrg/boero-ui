import type { SidebarNavigationEntry } from "@common/types/sidebar-navigation-entry.types";

export type SidebarNavigationSection = {
  label?: string;
  items: readonly SidebarNavigationEntry[];
};
