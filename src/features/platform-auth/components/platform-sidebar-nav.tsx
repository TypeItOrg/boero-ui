"use client";

import type { ReactElement } from "react";

import { SidebarNavigation } from "@common/components/navigation/sidebar-navigation";
import { useMobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";
import type { NavigationItem } from "@common/utils/navigation.util";

import { getAcademicSidebarNavigationSections } from "@features/academic/utils/academic-sidebar-navigation.util";

type PlatformSidebarNavProps = {
  sections: readonly { label?: string; items: readonly NavigationItem[] }[];
};

export function PlatformSidebarNav({ sections }: PlatformSidebarNavProps): ReactElement {
  const navigation = useMobileSidebarNavigation();

  return <SidebarNavigation sections={getAcademicSidebarNavigationSections(sections, "platform")} navigation={navigation} />;
}
