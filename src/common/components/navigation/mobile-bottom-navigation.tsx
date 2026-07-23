"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@common/utils/cn.util";
import { isNavigationItemActive, type NavigationItem } from "@common/utils/navigation.util";

type MobileBottomNavigationProps = {
  items: readonly NavigationItem[];
  primaryItem?: NavigationItem;
};

type OrderedNavigationItem = {
  item: NavigationItem;
  isPrimary: boolean;
};

export function MobileBottomNavigation({ items, primaryItem }: MobileBottomNavigationProps): React.ReactElement {
  const pathname = usePathname();
  const primaryIsActive = primaryItem ? isNavigationItemActive(pathname, primaryItem.url, primaryItem.exact) : false;
  const primaryIndex = Math.ceil(items.length / 2);
  const orderedItems: OrderedNavigationItem[] = items.map((item) => ({ item, isPrimary: false }));

  if (primaryItem) {
    orderedItems.splice(primaryIndex, 0, { item: primaryItem, isPrimary: true });
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="border-border bg-background fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex min-w-0 items-stretch px-2">
        {orderedItems.map(({ item, isPrimary }) => {
          const Icon = item.icon;
          const isActive = isPrimary
            ? primaryIsActive
            : !primaryIsActive && isNavigationItemActive(pathname, item.url, item.exact);

          return (
            <li key={item.url} className="flex min-w-0 flex-1 justify-center">
              <Link
                href={item.url}
                prefetch
                aria-current={isActive ? "page" : undefined}
                aria-label={item.ariaLabel}
                className={cn(
                  "group flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-center text-[11px] font-medium transition-colors",
                  isPrimary ? "text-foreground -mt-5 min-h-[5.75rem]" : "text-muted-foreground min-h-18",
                  !isPrimary && isActive && "text-primary",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center transition-all group-active:scale-95",
                    isPrimary ? "bg-primary text-primary-foreground size-14 rounded-full" : "size-8 rounded-xl",
                    !isPrimary && isActive && "bg-primary/10",
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={isPrimary ? "size-6" : "size-5"}
                    strokeWidth={isActive || isPrimary ? 2.5 : 2}
                  />
                </span>
                <span className="w-full truncate px-0.5">{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
