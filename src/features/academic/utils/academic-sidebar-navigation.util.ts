import { ClipboardListIcon, SettingsIcon } from "lucide-react";

import type { SidebarNavigationSection } from "@common/types/sidebar-navigation-section.types";
import type { NavigationItem } from "@common/utils/navigation.util";
import { groupSidebarNavigationSection } from "@common/utils/sidebar-navigation.util";

export function getAcademicSidebarNavigationSections(
  sections: readonly { label?: string; items: readonly NavigationItem[] }[],
  scope: "institutional" | "platform",
): SidebarNavigationSection[] {
  const prefix = scope === "platform" ? "/admin" : "";

  const enrollmentSections = groupSidebarNavigationSection(sections, {
    sectionLabel: "Académico",
    sourceSectionLabel: "Inscripciones",
    id: "academic-enrollments",
    title: "Inscripciones",
    icon: ClipboardListIcon,
    urls: ["/enrollment-periods", "/enrollment-applications"].map((url) => `${prefix}${url}`),
  });

  return groupSidebarNavigationSection(enrollmentSections, {
    sectionLabel: "Académico",
    id: "academic-settings",
    title: "Configuración",
    icon: SettingsIcon,
    urls: ["/academic-years", "/academic-spaces", "/instruments", "/shifts", "/documentation"].map((url) => `${prefix}${url}`),
  });
}
