import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { AcademicSpaceUsage } from "@features/academic/types/academic-space-usage.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { Instrument } from "@features/academic/types/instrument.types";
import type { Prerequisite } from "@features/academic/types/prerequisite.types";
import type { StudyPlanCurriculum } from "@features/academic/types/study-plan-curriculum.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";

const FETCH_ERROR = "No se pudo obtener la información académica.";

type PageParams = {
  deleted?: boolean;
  institutionId?: string;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
};

export async function fetchAcademicYears(
  scope: AcademicScope,
  institutionId: string | undefined,
  params: PageParams & {
    endDate?: string;
    startDate?: string;
    status?: AcademicYearStatus;
    validOn?: string;
    year?: number;
  } = {},
): Promise<PaginatedResponse<AcademicYear>> {
  return fetchPage(scope, institutionId, "academic-years", params);
}

export async function fetchAcademicYear(scope: AcademicScope, institutionId: string, id: string): Promise<AcademicYear | null> {
  return fetchDetail(scope, institutionId, `academic-years/${id}`);
}

export async function fetchTrainingPaths(
  scope: AcademicScope,
  institutionId: string | undefined,
  params: PageParams & { active?: boolean } = {},
): Promise<PaginatedResponse<TrainingPath>> {
  return fetchPage(scope, institutionId, "training-paths", params);
}

export async function fetchTrainingPath(scope: AcademicScope, institutionId: string, id: string): Promise<TrainingPath | null> {
  return fetchDetail(scope, institutionId, `training-paths/${id}`);
}

export async function fetchStudyPlans(
  scope: AcademicScope,
  institutionId: string | undefined,
  params: PageParams & {
    status?: StudyPlanStatus;
    trainingPathId?: string;
    validOn?: string;
  } = {},
): Promise<PaginatedResponse<StudyPlan>> {
  return fetchPage(scope, institutionId, "study-plans", params);
}

export async function fetchStudyPlan(scope: AcademicScope, institutionId: string, id: string): Promise<StudyPlan | null> {
  return fetchDetail(scope, institutionId, `study-plans/${id}`);
}

export async function fetchStudyPlanCurriculum(scope: AcademicScope, institutionId: string, id: string): Promise<StudyPlanCurriculum | null> {
  return fetchDetail(scope, institutionId, `study-plans/${id}/curriculum`);
}

export async function fetchAcademicSpaces(
  scope: AcademicScope,
  institutionId: string | undefined,
  params: PageParams & { active?: boolean; type?: AcademicSpaceType } = {},
): Promise<PaginatedResponse<AcademicSpace>> {
  return fetchPage(scope, institutionId, "academic-spaces", params);
}

export async function fetchAcademicSpace(scope: AcademicScope, institutionId: string, id: string): Promise<AcademicSpace | null> {
  return fetchDetail(scope, institutionId, `academic-spaces/${id}`);
}

export async function fetchAcademicSpaceUsage(
  scope: AcademicScope,
  institutionId: string,
  id: string,
  params: Pick<PageParams, "page" | "size"> = {},
): Promise<AcademicSpaceUsage | null> {
  return fetchDetailWithParams(scope, institutionId, `academic-spaces/${id}/usage`, params);
}

export async function fetchInstruments(
  scope: AcademicScope,
  institutionId: string | undefined,
  params: PageParams & { active?: boolean } = {},
): Promise<PaginatedResponse<Instrument>> {
  return fetchPage(scope, institutionId, "instruments", params);
}

export async function fetchInstrument(scope: AcademicScope, institutionId: string, id: string): Promise<Instrument | null> {
  return fetchDetail(scope, institutionId, `instruments/${id}`);
}

export async function fetchStudyPlanSpace(scope: AcademicScope, institutionId: string, id: string): Promise<StudyPlanSpace | null> {
  return fetchDetail(scope, institutionId, `study-plan-spaces/${id}`);
}

export async function fetchPrerequisite(scope: AcademicScope, institutionId: string, id: string): Promise<Prerequisite | null> {
  return fetchDetail(scope, institutionId, `prerequisites/${id}`);
}

async function fetchPage<T>(
  scope: AcademicScope,
  institutionId: string | undefined,
  resource: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResponse<T>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const base = institutionId ? getAcademicApiBase(scope, institutionId) : "/api/v1/admin";
  const response = await academicApiFetch(scope, `${base}/${resource}${query}`);
  return parseHttpResponse(response, FETCH_ERROR);
}

async function fetchDetail<T>(scope: AcademicScope, institutionId: string, resource: string): Promise<T | null> {
  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/${resource}`);
  return parseNullableHttpResponse(response, FETCH_ERROR);
}

async function fetchDetailWithParams<T>(
  scope: AcademicScope,
  institutionId: string,
  resource: string,
  params: Record<string, string | number | undefined>,
): Promise<T | null> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/${resource}${query}`);
  return parseNullableHttpResponse(response, FETCH_ERROR);
}
