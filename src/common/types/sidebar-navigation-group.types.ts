import type { LucideIcon } from "lucide-react";

import type { NavigationItem } from "@common/utils/navigation.util";

export type SidebarNavigationGroup = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: readonly NavigationItem[];
};
