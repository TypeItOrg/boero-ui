import type { AcademicPaginationParams } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export type AcademicFetchInput = AcademicPaginationParams & { institutionId: string; scope: AcademicScope };
