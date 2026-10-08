import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import type { ContextualSearchEntity } from "@features/contextual-search/types/contextual-search-entity.types";
import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";

export function getContextualSearchLabels(entityType: ContextualSearchEntity, item: ContextualSearchResult) {
  if (entityType === "study-plan") {
    return {
      title: formatStudyPlanName({ name: item.title, trainingPathName: item.subtitle, studyPlanVersion: item.studyPlanVersion }),
      subtitle: item.subtitle,
    };
  }

  return {
    title: item.title,
    subtitle:
      entityType === "course" && item.subtitle
        ? formatStudyPlanName({ name: item.subtitle, studyPlanVersion: item.studyPlanVersion })
        : item.subtitle,
  };
}
