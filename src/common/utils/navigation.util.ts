import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
  ariaLabel?: string;
};

export function isNavigationItemActive(pathname: string, url: string, exact = false): boolean {
  return exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}
