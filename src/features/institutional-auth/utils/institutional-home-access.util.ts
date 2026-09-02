import type { LucideIcon } from "lucide-react";
import { Building2Icon, FileTextIcon, KeyRoundIcon, UserRoundIcon, UserRoundPlusIcon, UsersIcon } from "lucide-react";

import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
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
  href: "/account",
  title: "Mi cuenta",
  description: "Administrá tus datos, contraseña y sesiones.",
  icon: UserRoundIcon,
};

const MANAGEMENT_LINKS: readonly InstitutionalHomeLink[] = [
  {
    href: "/enrollment-applications",
    title: "Mis solicitudes",
    description: "Continuá la carga de tu inscripción como postulante.",
    icon: FileTextIcon,
  },
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

export function getInstitutionalHomeLinks(user: Pick<InstitutionalUser, "permissions" | "roles">): InstitutionalHomeLink[] {
  return [PERSONAL_LINK, ...MANAGEMENT_LINKS].filter((link) => isHomeLinkVisible(user, link));
}

export function getInstitutionalHomeTasks(user: Pick<InstitutionalUser, "permissions" | "roles">): InstitutionalHomeLink[] {
  return MANAGEMENT_TASKS.filter((link) => isHomeLinkVisible(user, link));
}

function isHomeLinkVisible(user: Pick<InstitutionalUser, "permissions" | "roles">, link: InstitutionalHomeLink): boolean {
  if (link.href === "/enrollment-applications") return isApplicantInstitutionalUser(user);
  return link.permission === undefined || hasInstitutionalPermission(user, link.permission);
}
