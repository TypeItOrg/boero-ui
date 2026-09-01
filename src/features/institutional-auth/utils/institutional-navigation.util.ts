import {
  BookMarkedIcon,
  Building2Icon,
  CalendarRangeIcon,
  FilePenLineIcon,
  HouseIcon,
  LibraryBigIcon,
  Music2Icon,
  RouteIcon,
  UserLockIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";

import type { NavigationItem } from "@common/utils/navigation.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export type InstitutionalNavigationSection = {
  label?: string;
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
  const platformItems: NavigationItem[] = [
    ...(canReadInstitution ? [{ title: "Institución", url: "/institution", icon: Building2Icon }] : []),
    ...(canManagePeople ? [{ title: "Usuarios", url: "/people", icon: UsersIcon }] : []),
    ...(canReadRoles ? [{ title: "Roles", url: "/roles", icon: UserLockIcon }] : []),
  ];
  const academicItems: NavigationItem[] = [
    { title: "Inscripciones", url: "/enrollment", icon: FilePenLineIcon },
    ...(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_YEAR_READ)
      ? [{ title: "Ciclos lectivos", url: "/academic-years", icon: CalendarRangeIcon }]
      : []),
    ...(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.TRAINING_PATH_READ)
      ? [{ title: "Trayectos formativos", url: "/training-paths", icon: RouteIcon }]
      : []),
    ...(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.STUDY_PLAN_READ)
      ? [{ title: "Planes de estudio", url: "/study-plans", icon: BookMarkedIcon }]
      : []),
    ...(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_SPACE_READ)
      ? [{ title: "Espacios académicos", url: "/academic-spaces", icon: LibraryBigIcon }]
      : []),
    ...(hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTRUMENT_READ)
      ? [{ title: "Instrumentos", url: "/instruments", icon: Music2Icon }]
      : []),
  ];

  return [
    {
      items: [INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM],
    },
    ...(platformItems.length > 0 ? [{ label: "Plataforma", items: platformItems }] : []),
    ...(academicItems.length > 0 ? [{ label: "Académico", items: academicItems }] : []),
    {
      label: "General",
      items: [{ title: "Cuenta", url: "/account", icon: UserRoundIcon }],
    },
  ];
}
