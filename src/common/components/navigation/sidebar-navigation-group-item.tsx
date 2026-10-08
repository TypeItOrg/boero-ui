"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRightIcon } from "lucide-react";

import { useSidebarNavigationState } from "@common/components/navigation/sidebar-navigation-state-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@common/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@common/components/ui/sidebar";
import { SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME, SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME } from "@common/constants/sidebar-navigation.constants";
import type { MobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";
import type { SidebarNavigationGroup } from "@common/types/sidebar-navigation-group.types";

type SidebarNavigationGroupItemProps = {
  group: SidebarNavigationGroup;
  navigation: MobileSidebarNavigation;
};

export function SidebarNavigationGroupItem({ group, navigation }: SidebarNavigationGroupItemProps): ReactElement | null {
  const pathname = usePathname();
  const { isMobile, state: sidebarState } = useSidebar();
  const { groupStates, setGroupOpen } = useSidebarNavigationState();
  const suppressNextTooltipFocus = useRef(false);
  const activeItem = group.items.find((item) => navigation.isActive(item.url, item.exact));
  const activeUrl = activeItem?.url;
  const navigationKey = `${pathname}:${activeUrl ?? ""}`;

  const [expansion, setExpansion] = useState({
    navigationKey,
    open: groupStates[group.id] ?? Boolean(activeUrl),
    animate: false,
  });

  const Icon = group.icon;

  // Reopen on navigation into this group, not on unrelated renders or a manual close.
  if (expansion.navigationKey !== navigationKey) {
    const open = activeUrl ? true : expansion.open;

    setExpansion({ navigationKey, open, animate: expansion.animate || open !== expansion.open });
  }

  useEffect(() => {
    setGroupOpen(group.id, expansion.open);
  }, [group.id, expansion.open, setGroupOpen]);

  if (group.items.length === 0) {
    return null;
  }

  const groupButtonClassName = `${SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME} data-open:hover:bg-muted-foreground/10 data-open:hover:text-foreground data-active:bg-muted-foreground/10 data-active:text-foreground`;

  if (!isMobile && sidebarState === "collapsed") {
    const CollapsedIcon = activeItem?.icon ?? Icon;
    const collapsedLabel = activeItem ? `${group.title} › ${activeItem.ariaLabel ?? activeItem.title}` : group.title;

    return (
      <SidebarMenuItem>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (open) {
              suppressNextTooltipFocus.current = false;
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              type="button"
              aria-label={collapsedLabel}
              tooltip={collapsedLabel}
              isActive={Boolean(activeItem)}
              onFocus={(event) => {
                if (suppressNextTooltipFocus.current) {
                  suppressNextTooltipFocus.current = false;
                  // Keep Radix's restored focus without reopening the tooltip after navigation.
                  event.preventDefault();
                }
              }}
              className={`${SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME} ${SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME} data-active:data-open:hover:bg-primary data-active:data-open:hover:text-primary-foreground`}
            >
              <CollapsedIcon aria-hidden="true" />
              <span className="sr-only">{collapsedLabel}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-60 motion-reduce:animate-none">
            <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {group.items.map((item) => {
              const isActive = navigation.isActive(item.url, item.exact);
              const ItemIcon = item.icon;

              return (
                <DropdownMenuItem
                  key={item.url}
                  asChild
                  data-active={isActive}
                  className={`h-9 gap-3 px-2 ${SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME} data-active:focus:bg-primary data-active:focus:text-primary-foreground data-active:focus:**:text-primary-foreground!`}
                >
                  <Link
                    href={item.url}
                    prefetch
                    aria-label={item.ariaLabel}
                    aria-current={isActive ? "page" : undefined}
                    onNavigate={() => {
                      suppressNextTooltipFocus.current = true;
                      navigation.handleNavigation(item.url);
                    }}
                  >
                    <ItemIcon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      asChild
      open={expansion.open}
      onOpenChange={(open) => setExpansion({ navigationKey, open, animate: true })}
      className="group/navigation-group"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton type="button" isActive={Boolean(activeUrl)} className={groupButtonClassName}>
            <Icon aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{group.title}</span>
            <ChevronRightIcon
              aria-hidden="true"
              className="ml-auto transition-transform duration-150 ease-out group-data-[state=open]/navigation-group:rotate-90 motion-reduce:transition-none"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent data-animate={expansion.animate} className="sidebar-navigation-collapse overflow-hidden">
          <SidebarMenuSub className="my-1 mr-0 ml-4 gap-0 pr-0 pl-2">
            {group.items.map((item) => {
              const isActive = navigation.isActive(item.url, item.exact);
              const ItemIcon = item.icon;

              return (
                <SidebarMenuSubItem key={item.url}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isActive}
                    className={`text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground h-9 gap-3 px-2 transition-colors motion-reduce:transition-none [&>svg]:text-current ${SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME}`}
                  >
                    <Link
                      href={item.url}
                      prefetch
                      aria-label={item.ariaLabel}
                      aria-current={isActive ? "page" : undefined}
                      onNavigate={() => navigation.handleNavigation(item.url)}
                    >
                      <ItemIcon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
