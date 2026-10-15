import { ClipboardListIcon, SettingsIcon } from "lucide-react";

import type { SidebarNavigationSection } from "@common/types/sidebar-navigation-section.types";
import type { NavigationItem } from "@common/utils/navigation.util";
import { groupSidebarNavigationSection } from "@common/utils/sidebar-navigation.util";

export function getAcademicSidebarNavigationSections(
  sections: readonly { label?: string; items: readonly NavigationItem[] }[],
  scope: "institutional" | "platform",
): SidebarNavigationSection[] {
  const prefix = scope === "platform" ? "/admin" : "";

  const guardianLinksUrl = `${prefix}/guardian-links`;

  const guardianLinksItem = sections.flatMap((section) => section.items).find((item) => item.url === guardianLinksUrl);

  const managementLabel = scope === "platform" ? "Gestión" : "Institución";

  const enrollmentTitles: Record<string, string> = {
    [`${prefix}/enrollment-periods`]: "Períodos",
    [`${prefix}/enrollment-applications`]: "Solicitudes",
  };

  const sidebarSections = sections.map((section) => ({
    ...section,
    items: section.items
      .filter((item) => item.url !== guardianLinksUrl)
      .map((item) => ({ ...item, title: enrollmentTitles[item.url] ?? item.title })),
  }));

  if (guardianLinksItem) {
    const item = { ...guardianLinksItem, title: "Vinculaciones" };

    const managementSection = sidebarSections.find((section) => section.label === managementLabel);

    if (managementSection) {
      managementSection.items.push(item);
    } else {
      sidebarSections.splice(1, 0, { label: managementLabel, items: [item] });
    }
  }

  const enrollmentSections = groupSidebarNavigationSection(
    sidebarSections.filter((section) => section.items.length > 0),
    {
      sectionLabel: "Académico",
      sourceSectionLabel: "Inscripciones",
      id: "academic-enrollments",
      title: "Inscripciones",
      icon: ClipboardListIcon,
      urls: ["/enrollment-periods", "/enrollment-applications"].map((url) => `${prefix}${url}`),
    },
  );

  return groupSidebarNavigationSection(enrollmentSections, {
    sectionLabel: "Académico",
    id: "academic-settings",
    title: "Configuración",
    icon: SettingsIcon,
    urls: ["/academic-years", "/academic-spaces", "/instruments", "/shifts", "/documentation"].map((url) => `${prefix}${url}`),
  });
}
