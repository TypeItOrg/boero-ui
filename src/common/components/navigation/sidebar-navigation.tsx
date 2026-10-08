"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { SidebarNavigationGroupItem } from "@common/components/navigation/sidebar-navigation-group-item";
import { Separator } from "@common/components/ui/separator";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@common/components/ui/sidebar";
import { SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME, SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME } from "@common/constants/sidebar-navigation.constants";
import type { MobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";
import type { SidebarNavigationSection } from "@common/types/sidebar-navigation-section.types";

type SidebarNavigationProps = {
  sections: readonly SidebarNavigationSection[];
  navigation: MobileSidebarNavigation;
};

export function SidebarNavigation({ sections, navigation }: SidebarNavigationProps): ReactElement {
  return (
    <div className="flex flex-col gap-3 group-data-[collapsible=icon]:gap-2">
      {sections.map((section, index) => (
        <SidebarGroup key={section.label ?? index} className="gap-1 p-0 group-data-[collapsible=icon]:gap-0">
          {index > 0 ? <Separator className="my-2 hidden group-data-[collapsible=icon]:block" /> : null}
          {section.label ? (
            <SidebarGroupLabel className="text-muted-foreground h-7 pr-2 pl-0 text-xs font-bold group-data-[collapsible=icon]:hidden">
              {section.label}
            </SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0 group-data-[collapsible=icon]:gap-2">
              {section.items.map((item) => {
                if ("items" in item) {
                  return <SidebarNavigationGroupItem key={item.id} group={item} navigation={navigation} />;
                }

                const isActive = navigation.isActive(item.url, item.exact);

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`${SIDEBAR_NAVIGATION_BUTTON_CLASS_NAME} ${SIDEBAR_NAVIGATION_ACTIVE_CLASS_NAME}`}
                    >
                      <Link
                        href={item.url}
                        prefetch
                        aria-label={item.ariaLabel}
                        aria-current={isActive ? "page" : undefined}
                        onNavigate={() => navigation.handleNavigation(item.url)}
                      >
                        <Icon aria-hidden="true" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}
