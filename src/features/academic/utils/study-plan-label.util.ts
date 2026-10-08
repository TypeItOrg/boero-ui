import { STUDY_PLAN_VERSION_FALLBACK, STUDY_PLAN_VERSION_LABELS } from "@features/academic/constants/study-plan-label.constants";
import type { StudyPlanLabel } from "@features/academic/types/study-plan-label.types";

export function formatStudyPlanVersion(version?: number | null): string | null {
  if (!version || version <= 1) {
    return null;
  }

  return STUDY_PLAN_VERSION_LABELS[version] ?? STUDY_PLAN_VERSION_FALLBACK(version);
}

function getStudyPlanNames(plan: StudyPlanLabel) {
  const name = (plan.name ?? plan.studyPlanName ?? "").trim();
  const path = plan.trainingPathName?.trim() ?? "";
  const suffix = path && name.startsWith(path) ? name.slice(path.length) : "";
  const shortName = /^\s*[-–—·:]\s*/.test(suffix) ? suffix.replace(/^\s*[-–—·:]\s*/, "").trim() : name;

  return { name, path, shortName };
}

function appendVersion(name: string, plan: StudyPlanLabel): string {
  const version = formatStudyPlanVersion(plan.versionNumber ?? plan.studyPlanVersion);

  return version ? `${name} · ${version}` : name;
}

// Use when the training path is already visible beside the plan.
export function formatStudyPlanName(plan: StudyPlanLabel): string {
  return appendVersion(getStudyPlanNames(plan).shortName, plan);
}

// Use for standalone labels and selectors, preserving the training path once.
export function formatStudyPlanLabel(plan: StudyPlanLabel): string {
  const { name, path, shortName } = getStudyPlanNames(plan);
  const label = !path || name === path || shortName !== name ? name : `${path} · ${name}`;

  return appendVersion(label, plan);
}
