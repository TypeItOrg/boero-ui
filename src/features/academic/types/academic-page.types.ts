import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";

export type AcademicPage = PaginatedResponse<AcademicCollection>;
