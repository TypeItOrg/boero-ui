"use client";

import type { ReactElement } from "react";

import { SidebarNavigation } from "@common/components/navigation/sidebar-navigation";
import type { MobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";

import { getAcademicSidebarNavigationSections } from "@features/academic/utils/academic-sidebar-navigation.util";
import type { InstitutionalNavigationSection } from "@features/institutional-auth/utils/institutional-navigation.util";

type InstitutionalSidebarNavProps = {
  sections: readonly InstitutionalNavigationSection[];
  navigation: MobileSidebarNavigation;
};

export function InstitutionalSidebarNav({ sections, navigation }: InstitutionalSidebarNavProps): ReactElement {
  return <SidebarNavigation sections={getAcademicSidebarNavigationSections(sections, "institutional")} navigation={navigation} />;
}
