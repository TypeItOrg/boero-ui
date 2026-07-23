import { BuildingIcon, FingerprintIcon, HouseIcon, UserLockIcon, UsersIcon } from "lucide-react";

import type { NavigationItem } from "@common/utils/navigation.util";

export const PLATFORM_NAVIGATION_ITEMS = [
  {
    title: "Inicio",
    url: "/admin",
    icon: HouseIcon,
    exact: true,
  },
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
  {
    title: "Administradores",
    url: "/admin/accounts",
    icon: FingerprintIcon,
  },
] as const satisfies readonly NavigationItem[];

export const PLATFORM_PRIMARY_NAVIGATION_ITEM = PLATFORM_NAVIGATION_ITEMS[0];

export const PLATFORM_BOTTOM_NAVIGATION_ITEMS = PLATFORM_NAVIGATION_ITEMS.slice(1);
