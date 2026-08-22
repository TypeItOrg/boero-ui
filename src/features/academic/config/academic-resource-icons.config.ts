import {
  BookMarkedIcon,
  BookPlusIcon,
  CalendarRangeIcon,
  ClockIcon,
  GitBranchPlusIcon,
  Layers3Icon,
  LibraryBigIcon,
  Music2Icon,
  RouteIcon,
  type LucideIcon,
} from "lucide-react";

import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const ACADEMIC_RESOURCE_ICONS: Readonly<Record<AcademicResource, LucideIcon>> = {
  [AcademicResource.ACADEMIC_YEAR]: CalendarRangeIcon,
  [AcademicResource.TRAINING_PATH]: RouteIcon,
  [AcademicResource.STUDY_PLAN]: BookMarkedIcon,
  [AcademicResource.ACADEMIC_LEVEL]: Layers3Icon,
  [AcademicResource.STUDY_PLAN_SPACE]: BookPlusIcon,
  [AcademicResource.PREREQUISITE]: GitBranchPlusIcon,
  [AcademicResource.ACADEMIC_SPACE]: LibraryBigIcon,
  [AcademicResource.INSTRUMENT]: Music2Icon,
  [AcademicResource.SHIFT]: ClockIcon,
};
