import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import {
  fetchAcademicSpaces,
  fetchAcademicYears,
  fetchCourses,
  fetchInstruments,
  fetchStudyPlans,
  fetchTrainingPaths,
} from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { Course } from "@features/academic/types/course.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { Instrument } from "@features/academic/types/instrument.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { academicSpaceTypeLabels, academicYearStatusLabels, studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicRecentItem = {
  active: boolean;
  detail: string;
  id: string;
  label: string;
  resource: AcademicCollectionResource;
  section: string;
};

type RecentPageFetcher<T> = () => Promise<PaginatedResponse<T>>;

const RECENT_QUERY = { page: 0, size: 1, sort: "createdAt,desc" } as const;

export async function fetchAcademicRecentItems(scope: AcademicScope, institutionId: string, access: AcademicAccess): Promise<AcademicRecentItem[]> {
  const requests: Array<Promise<AcademicRecentItem | null>> = [];

  if (access.yearRead) {
    requests.push(
      loadRecentItem(
        () => fetchAcademicYears(scope, institutionId, RECENT_QUERY),
        AcademicResource.ACADEMIC_YEAR,
        "Ciclos lectivos",
        mapAcademicYear,
      ),
    );
  }
  if (access.trainingPathRead) {
    requests.push(
      loadRecentItem(
        () => fetchTrainingPaths(scope, institutionId, RECENT_QUERY),
        AcademicResource.TRAINING_PATH,
        "Trayectos formativos",
        mapTrainingPath,
      ),
    );
  }
  if (access.studyPlanRead) {
    requests.push(
      loadRecentItem(() => fetchStudyPlans(scope, institutionId, RECENT_QUERY), AcademicResource.STUDY_PLAN, "Planes de estudio", mapStudyPlan),
    );
  }
  if (access.academicSpaceRead) {
    requests.push(
      loadRecentItem(
        () => fetchAcademicSpaces(scope, institutionId, RECENT_QUERY),
        AcademicResource.ACADEMIC_SPACE,
        "Espacios académicos",
        mapAcademicSpace,
      ),
    );
  }
  if (access.instrumentRead) {
    requests.push(
      loadRecentItem(() => fetchInstruments(scope, institutionId, RECENT_QUERY), AcademicResource.INSTRUMENT, "Instrumentos", mapInstrument),
    );
  }
  if (access.courseRead) {
    requests.push(loadRecentItem(() => fetchCourses(scope, institutionId, RECENT_QUERY), AcademicResource.COURSE, "Cursos", mapCourse));
  }

  return (await Promise.all(requests)).filter((item): item is AcademicRecentItem => item !== null);
}

async function loadRecentItem<T>(
  fetchPage: RecentPageFetcher<T>,
  resource: AcademicCollectionResource,
  section: string,
  mapItem: (item: T) => Omit<AcademicRecentItem, "resource" | "section">,
): Promise<AcademicRecentItem | null> {
  const page = await fetchPage();
  const item = page.items[0];
  if (!item) return null;
  return { ...mapItem(item), resource, section };
}

function mapAcademicYear(item: AcademicYear): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: String(item.year),
    detail: academicYearStatusLabels[item.status],
    active: item.status === "ACTIVE",
  };
}

function mapTrainingPath(item: TrainingPath): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: item.name,
    detail: item.active ? "Activo" : "Inactivo",
    active: item.active,
  };
}

function mapStudyPlan(item: StudyPlan): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: item.name,
    detail: studyPlanStatusLabels[item.status],
    active: item.status === "ACTIVE",
  };
}

function mapAcademicSpace(item: AcademicSpace): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: item.name,
    detail: academicSpaceTypeLabels[item.type],
    active: item.active,
  };
}

function mapInstrument(item: Instrument): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: item.name,
    detail: item.active ? "Activo" : "Inactivo",
    active: item.active,
  };
}

function mapCourse(item: Course): Omit<AcademicRecentItem, "resource" | "section"> {
  return {
    id: item.id,
    label: `${item.academicSpaceName} · ${item.studyPlanName}`,
    detail: `${item.year}`,
    active: item.active,
  };
}
