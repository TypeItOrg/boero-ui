"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { Separator } from "@common/components/ui/separator";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@common/components/ui/sidebar";

export type InstitutionalNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
};

type InstitutionalNavSection = {
  label: string;
  items: readonly InstitutionalNavItem[];
};

type InstitutionalSidebarNavProps = {
  sections: readonly InstitutionalNavSection[];
};

export function InstitutionalSidebarNav({ sections }: InstitutionalSidebarNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3 group-data-[collapsible=icon]:gap-2">
      {sections.map((section, index) => (
        <SidebarGroup key={section.label} className="gap-1 p-0 group-data-[collapsible=icon]:gap-0">
          {index > 0 ? <Separator className="my-2 hidden group-data-[collapsible=icon]:block" /> : null}
          <SidebarGroupLabel className="text-muted-foreground h-7 pr-2 pl-0 text-xs font-bold group-data-[collapsible=icon]:hidden">
            {section.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0 group-data-[collapsible=icon]:gap-2">
              {section.items.map((item) => {
                const isActive = isRouteActive(pathname, item);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground h-9 gap-3 rounded-md px-2 text-sm font-medium transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0!"
                    >
                      <Link href={item.url} prefetch aria-current={isActive ? "page" : undefined}>
                        <Icon />
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

function isRouteActive(pathname: string, item: InstitutionalNavItem): boolean {
  return item.exact ? pathname === item.url : pathname === item.url || pathname.startsWith(`${item.url}/`);
}
