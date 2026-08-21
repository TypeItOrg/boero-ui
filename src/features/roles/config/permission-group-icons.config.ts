import { Building2Icon, ClipboardCheckIcon, GraduationCapIcon, ShieldCheckIcon, UsersRoundIcon, type LucideIcon } from "lucide-react";

const PERMISSION_GROUP_ICONS: Readonly<Record<string, LucideIcon>> = {
  ACADEMIC: GraduationCapIcon,
  GRADES: ClipboardCheckIcon,
  INSTITUTION: Building2Icon,
  PEOPLE: UsersRoundIcon,
  ROLES: ShieldCheckIcon,
};

export function getPermissionGroupIcon(code: string): LucideIcon {
  return PERMISSION_GROUP_ICONS[code] ?? ShieldCheckIcon;
}
