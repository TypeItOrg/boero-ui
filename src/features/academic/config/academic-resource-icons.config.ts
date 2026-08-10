import {
  BookMarkedIcon,
  CalendarRangeIcon,
  LibraryBigIcon,
  Music2Icon,
  RouteIcon,
  type LucideIcon,
} from "lucide-react";

import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const ACADEMIC_RESOURCE_ICONS: Readonly<Record<AcademicCollectionResource, LucideIcon>> = {
  [AcademicResource.ACADEMIC_YEAR]: CalendarRangeIcon,
  [AcademicResource.TRAINING_PATH]: RouteIcon,
  [AcademicResource.STUDY_PLAN]: BookMarkedIcon,
  [AcademicResource.ACADEMIC_SPACE]: LibraryBigIcon,
  [AcademicResource.INSTRUMENT]: Music2Icon,
};
