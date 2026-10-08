import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { type RouteDetailInput } from "@features/academic/types/academic-route-detail-input.types";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export async function fetchAcademicDetailDocumentRequirements(
  input: Pick<RouteDetailInput, "scope" | "institutionId" | "resource" | "id" | "action">,
): Promise<DocumentRequirement[]> {
  let documentRequirements: DocumentRequirement[] = [];

  if (input.resource === AcademicResource.TRAINING_PATH && (!input.action || input.action === ACADEMIC_ROUTE_SEGMENT.EDIT)) {
    const response = await academicApiFetch(
      input.scope,
      `${getAcademicApiBase(input.scope, input.institutionId)}/training-paths/${input.id}/document-requirements`,
    );

    if (!response.ok) {
      throw new Error(DOCUMENT_MESSAGES.readFailed);
    }

    documentRequirements = (await response.json()) as DocumentRequirement[];
  }

  return documentRequirements;
}
