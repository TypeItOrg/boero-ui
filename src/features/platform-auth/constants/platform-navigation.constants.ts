import {
  BookMarkedIcon,
  BuildingIcon,
  CalendarRangeIcon,
  FingerprintIcon,
  GraduationCapIcon,
  HouseIcon,
  LibraryBigIcon,
  Music2Icon,
  RouteIcon,
  UserLockIcon,
  UsersIcon,
} from "lucide-react";

import type { NavigationItem } from "@common/utils/navigation.util";

const PRIMARY_NAVIGATION_ITEM = {
  title: "Inicio",
  url: "/admin",
  icon: HouseIcon,
  exact: true,
} as const satisfies NavigationItem;

const MANAGEMENT_NAVIGATION_ITEMS = [
  {
    title: "Instituciones",
    url: "/admin/institutions",
    icon: BuildingIcon,
  },
  {
    title: "Usuarios",
    url: "/admin/people",
    icon: UsersIcon,
  },
  {
    title: "Roles",
    url: "/admin/roles",
    icon: UserLockIcon,
  },
] as const satisfies readonly NavigationItem[];

const ACADEMIC_NAVIGATION_ITEMS = [
  {
    title: "Cursos",
    url: "/admin/courses",
    icon: GraduationCapIcon,
  },
  {
    title: "Ciclos lectivos",
    url: "/admin/academic-years",
    icon: CalendarRangeIcon,
  },
  {
    title: "Trayectos formativos",
    url: "/admin/training-paths",
    icon: RouteIcon,
  },
  {
    title: "Planes de estudio",
    url: "/admin/study-plans",
    icon: BookMarkedIcon,
  },
  {
    title: "Espacios académicos",
    url: "/admin/academic-spaces",
    icon: LibraryBigIcon,
  },
  {
    title: "Instrumentos",
    url: "/admin/instruments",
    icon: Music2Icon,
  },
] as const satisfies readonly NavigationItem[];

const PLATFORM_NAVIGATION_ITEM = {
  title: "Administradores",
  url: "/admin/accounts",
  icon: FingerprintIcon,
} as const satisfies NavigationItem;

export const PLATFORM_NAVIGATION_ITEMS = [
  PRIMARY_NAVIGATION_ITEM,
  ...MANAGEMENT_NAVIGATION_ITEMS,
  ...ACADEMIC_NAVIGATION_ITEMS,
  PLATFORM_NAVIGATION_ITEM,
] as const satisfies readonly NavigationItem[];

export const PLATFORM_PRIMARY_NAVIGATION_ITEM = PRIMARY_NAVIGATION_ITEM;

export const PLATFORM_BOTTOM_NAVIGATION_ITEMS = [...MANAGEMENT_NAVIGATION_ITEMS, PLATFORM_NAVIGATION_ITEM] as const;

export const PLATFORM_NAVIGATION_SECTIONS = [
  {
    items: [PRIMARY_NAVIGATION_ITEM],
  },
  {
    label: "Gestión",
    items: MANAGEMENT_NAVIGATION_ITEMS,
  },
  {
    label: "Académico",
    items: ACADEMIC_NAVIGATION_ITEMS,
  },
  {
    label: "Plataforma",
    items: [PLATFORM_NAVIGATION_ITEM],
  },
] as const;
