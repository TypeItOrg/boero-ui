"use client";

import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { ChevronRightIcon, type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@common/components/ui/collapsible";
import { Separator } from "@common/components/ui/separator";
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
} from "@common/components/ui/sidebar";
import { useMobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";

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

type PlatformSidebarNavSection = {
  label?: string;
  items: readonly PlatformSidebarNavItem[];
};

type PlatformSidebarNavProps = {
  sections: readonly PlatformSidebarNavSection[];
};

export const platformSidebarItemButtonClassName =
  "text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground data-open:bg-muted-foreground/10 data-open:text-foreground data-open:hover:bg-muted-foreground/10 h-9 gap-3 rounded-md px-2 text-sm font-medium transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0!";

export function PlatformSidebarNav({ sections }: PlatformSidebarNavProps): ReactElement {
  const { handleNavigation, isActive } = useMobileSidebarNavigation();

  return (
    <div className="flex flex-col gap-3 group-data-[collapsible=icon]:gap-2">
      {sections.map((section, sectionIndex) => (
        <SidebarGroup key={section.label ?? section.items[0]?.url} className="gap-1 p-0 group-data-[collapsible=icon]:gap-0">
          {sectionIndex > 0 ? <Separator className="my-2 hidden group-data-[collapsible=icon]:block" /> : null}
          {section.label ? (
            <SidebarGroupLabel className="text-muted-foreground h-7 pr-2 pl-0 text-xs font-bold group-data-[collapsible=icon]:hidden">
              {section.label}
            </SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0 group-data-[collapsible=icon]:gap-2">
              {section.items.map((item) => {
                const itemIsActive = isActive(item.url, item.exact);
                const ItemIcon = item.icon;

                if (!item.items?.length) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className={platformSidebarItemButtonClassName} tooltip={item.title} isActive={itemIsActive}>
                        <Link href={item.url} prefetch aria-current={itemIsActive ? "page" : undefined} onClick={() => handleNavigation(item.url)}>
                          <PlatformSidebarNavigationIcon icon={ItemIcon} />
                          <PlatformSidebarItemLabel>{item.title}</PlatformSidebarItemLabel>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible key={item.title} asChild defaultOpen={itemIsActive} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className={platformSidebarItemButtonClassName} tooltip={item.title} isActive={itemIsActive}>
                          <PlatformSidebarNavigationIcon icon={ItemIcon} />
                          <PlatformSidebarItemLabel>{item.title}</PlatformSidebarItemLabel>
                          <ChevronRightIcon className="absolute right-2 bottom-2 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubItemActive = isActive(subItem.url);

                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                                  <Link
                                    href={subItem.url}
                                    prefetch
                                    aria-current={isSubItemActive ? "page" : undefined}
                                    onClick={() => handleNavigation(subItem.url)}
                                  >
                                    <span>{subItem.title}</span>
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
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}

export function PlatformSidebarItemIcon({ children }: { children: ReactNode }): ReactElement {
  return <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-4!">{children}</span>;
}

function PlatformSidebarNavigationIcon({ icon: Icon }: { icon: LucideIcon | undefined }): ReactElement {
  return <PlatformSidebarItemIcon>{Icon ? <Icon /> : null}</PlatformSidebarItemIcon>;
}

function PlatformSidebarItemLabel({ children }: { children: ReactNode }): ReactElement {
  return <span className="group-data-[collapsible=icon]:hidden">{children}</span>;
}
