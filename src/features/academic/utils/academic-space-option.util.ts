import type { AcademicSpaceOptionPresentation } from "@features/academic/types/academic-space-option-presentation.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";

const LEVEL_GROUP_COLLATOR = new Intl.Collator("es", { numeric: true, sensitivity: "base" });

const UNASSIGNED_LEVEL_LABEL = "Sin nivel";

export function getAcademicSpaceOptionGroup(item: AcademicSpaceOptionPresentation): string | undefined {
  return item.format ? (academicSpaceFormatLabels[item.format as keyof typeof academicSpaceFormatLabels] ?? item.format) : undefined;
}

export function getAcademicSpaceOptionDescription(item: AcademicSpaceOptionPresentation): string {
  const type = item.type ? (academicSpaceTypeLabels[item.type as keyof typeof academicSpaceTypeLabels] ?? item.type) : undefined;

  return [item.academicLevelName, type].filter(Boolean).join(" · ");
}

export function getAcademicSpaceOptionLabel(item: AcademicSpaceOptionPresentation): string {
  return [item.name, getAcademicSpaceOptionDescription(item), getAcademicSpaceOptionGroup(item)].filter(Boolean).join(" · ");
}

const SPACE_OPTION_CONTENT = {
  estimateSize: 56,
  getItemDisplayLabel: (item: AcademicSpaceOptionPresentation) => item.name ?? "",
};

export const ACADEMIC_SPACE_OPTION_PRESENTATION = {
  ...SPACE_OPTION_CONTENT,
  getItemDescription: getAcademicSpaceOptionDescription,
  getItemGroup: getAcademicSpaceOptionGroup,
  groupOrder: [academicSpaceFormatLabels.INDIVIDUAL, academicSpaceFormatLabels.GRUPAL],
};

function getStudyPlanSpaceOptionDescription(item: AcademicSpaceOptionPresentation): string {
  return [getAcademicSpaceOptionDescription({ ...item, academicLevelName: null }), getAcademicSpaceOptionGroup(item)].filter(Boolean).join(" · ");
}

function compareLevelGroups(left: string, right: string): number {
  if (left === UNASSIGNED_LEVEL_LABEL) {
    return right === UNASSIGNED_LEVEL_LABEL ? 0 : 1;
  }

  if (right === UNASSIGNED_LEVEL_LABEL) {
    return -1;
  }

  return LEVEL_GROUP_COLLATOR.compare(left, right);
}

export const STUDY_PLAN_SPACE_OPTION_PRESENTATION = {
  ...SPACE_OPTION_CONTENT,
  compareGroups: compareLevelGroups,
  getItemDescription: getStudyPlanSpaceOptionDescription,
  getItemGroup: (item: AcademicSpaceOptionPresentation) => item.academicLevelName?.trim() || UNASSIGNED_LEVEL_LABEL,
};
