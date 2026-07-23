import { Building2Icon, HouseIcon, UserLockIcon, UserRoundIcon, UsersIcon } from "lucide-react";

import type { NavigationItem } from "@common/utils/navigation.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export type InstitutionalNavigationSection = {
  label: string;
  items: readonly NavigationItem[];
};

export const INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM = {
  title: "Inicio",
  url: "/",
  icon: HouseIcon,
  exact: true,
} satisfies NavigationItem;

export function getInstitutionalNavigationSections(user: InstitutionalUser): InstitutionalNavigationSection[] {
  const canManagePeople = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY);
  const canReadRoles = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_READ);
  const canReadInstitution = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_READ);

  return [
    {
      label: "Plataforma",
      items: [
        INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM,
        ...(canReadInstitution ? [{ title: "Institución", url: "/institution", icon: Building2Icon }] : []),
        ...(canManagePeople ? [{ title: "Usuarios", url: "/people", icon: UsersIcon }] : []),
        ...(canReadRoles ? [{ title: "Roles", url: "/roles", icon: UserLockIcon }] : []),
      ],
    },
    {
      label: "General",
      items: [{ title: "Perfil", url: "/profile", icon: UserRoundIcon }],
    },
  ];
}
