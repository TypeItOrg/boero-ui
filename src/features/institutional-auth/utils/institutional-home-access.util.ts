import type { LucideIcon } from "lucide-react";
import { Building2Icon, KeyRoundIcon, UserRoundIcon, UserRoundPlusIcon, UsersIcon } from "lucide-react";

import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION, type InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

export type InstitutionalHomeLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  permission?: InstitutionalPermission;
};

const PERSONAL_LINK: InstitutionalHomeLink = {
  href: "/profile",
  title: "Mi perfil",
  description: "Consultá y actualizá tus datos personales.",
  icon: UserRoundIcon,
};

const MANAGEMENT_LINKS: readonly InstitutionalHomeLink[] = [
  {
    href: "/institution",
    title: "Institución",
    description: "Consultá y actualizá la información de tu institución.",
    icon: Building2Icon,
    permission: INSTITUTIONAL_PERMISSION.INSTITUTION_READ,
  },
  {
    href: "/people",
    title: "Usuarios",
    description: "Buscá y gestioná las personas de tu institución.",
    icon: UsersIcon,
    permission: INSTITUTIONAL_PERMISSION.PERSON_READ_ANY,
  },
  {
    href: "/roles",
    title: "Roles y permisos",
    description: "Organizá los accesos y responsabilidades institucionales.",
    icon: KeyRoundIcon,
    permission: INSTITUTIONAL_PERMISSION.ROLE_READ,
  },
];

const MANAGEMENT_TASKS: readonly InstitutionalHomeLink[] = [
  {
    href: "/people/new",
    title: "Registrar usuario",
    description: "Sumá una persona a la institución.",
    icon: UserRoundPlusIcon,
    permission: INSTITUTIONAL_PERMISSION.PERSON_CREATE,
  },
  {
    href: "/roles/new",
    title: "Crear rol",
    description: "Definí un conjunto de permisos.",
    icon: KeyRoundIcon,
    permission: INSTITUTIONAL_PERMISSION.ROLE_CREATE,
  },
];

export function getInstitutionalHomeLinks(user: Pick<InstitutionalUser, "permissions">): InstitutionalHomeLink[] {
  return [PERSONAL_LINK, ...MANAGEMENT_LINKS].filter((link) => isHomeLinkVisible(user, link));
}

export function getInstitutionalHomeTasks(user: Pick<InstitutionalUser, "permissions">): InstitutionalHomeLink[] {
  return MANAGEMENT_TASKS.filter((link) => isHomeLinkVisible(user, link));
}

function isHomeLinkVisible(user: Pick<InstitutionalUser, "permissions">, link: InstitutionalHomeLink): boolean {
  return link.permission === undefined || hasInstitutionalPermission(user, link.permission);
}
