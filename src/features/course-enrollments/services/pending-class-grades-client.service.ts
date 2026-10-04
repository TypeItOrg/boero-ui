import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { PendingClassGrades } from "@features/course-enrollments/types/pending-class-grades.types";

export async function fetchPendingClassesClient(): Promise<PendingClassGrades[]> {
  const response = await fetch("/api/course-classes/grades/pending-classes", { cache: "no-store" });

  return parseHttpResponse(response, "No se pudieron cargar las clases con cambios pendientes.");
}
