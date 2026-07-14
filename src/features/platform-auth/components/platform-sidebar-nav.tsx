"use client";

import { usePathname } from "next/navigation";
import type { ReactElement, ReactNode } from "react";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@common/components/ui/collapsible";
import { NavigationLink } from "@common/components/ui/navigation-link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@common/components/ui/sidebar";

type PlatformSidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  exact?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

type PlatformSidebarNavProps = {
  items: PlatformSidebarNavItem[];
};

export const platformSidebarItemButtonClassName =
  "text-muted-foreground/80 h-11 gap-3 rounded-lg px-2 text-base font-normal hover:bg-transparent hover:text-foreground active:bg-transparent data-active:bg-primary data-active:font-medium data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground data-open:hover:bg-transparent group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0!";

export function PlatformSidebarNav({ items }: PlatformSidebarNavProps): ReactElement {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <SidebarGroup className="gap-1 px-4 py-0">
      {state === "expanded" && (
        <SidebarGroupLabel className="h-6 px-2 text-[13px] font-medium tracking-[0.02em] text-[#969d99] uppercase">
          Menú
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2">
          {items.map((item) => {
            const isActive = item.exact
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(`${item.url}/`);
            const ItemIcon = item.icon;

            if (!item.items?.length) {
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={platformSidebarItemButtonClassName}
                    tooltip={item.title}
                    isActive={isActive}
                  >
                    <NavigationLink href={item.url} aria-current={isActive ? "page" : undefined} pendingVariant="pulse">
                      <PlatformSidebarNavigationIcon icon={ItemIcon} />
                      <PlatformSidebarItemLabel>{item.title}</PlatformSidebarItemLabel>
                    </NavigationLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={platformSidebarItemButtonClassName}
                      tooltip={item.title}
                      isActive={isActive}
                    >
                      <PlatformSidebarNavigationIcon icon={ItemIcon} />
                      <PlatformSidebarItemLabel>{item.title}</PlatformSidebarItemLabel>
                      <ChevronRightIcon className="absolute right-2 bottom-2 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavigationLink href={subItem.url} pendingVariant="pulse">
                              <span>{subItem.title}</span>
                            </NavigationLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function PlatformSidebarItemIcon({ children }: { children: ReactNode }): ReactElement {
  return <span className="flex size-5 shrink-0 items-center justify-center [&>svg]:size-5!">{children}</span>;
}

function PlatformSidebarNavigationIcon({ icon: Icon }: { icon: LucideIcon | undefined }): ReactElement {
  return <PlatformSidebarItemIcon>{Icon ? <Icon /> : null}</PlatformSidebarItemIcon>;
}

function PlatformSidebarItemLabel({ children }: { children: ReactNode }): ReactElement {
  return <span className="group-data-[collapsible=icon]:hidden">{children}</span>;
}
