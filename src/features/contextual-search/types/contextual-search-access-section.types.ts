import type { NavigationItem } from "@common/utils/navigation.util";

export type ContextualSearchAccessSection = {
  label?: string;
  items: readonly NavigationItem[];
};
