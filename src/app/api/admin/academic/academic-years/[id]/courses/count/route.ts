import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, AcademicScope } from "@features/academic/utils/academic-scope.util";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get("institutionId");
  if (!institutionId) {
    return Response.json({ message: "Falta institutionId" }, { status: 400 });
  }
  const backendPath = `${getAcademicApiBase(AcademicScope.ADMIN, institutionId)}/academic-years/${id}/courses/count`;
  try {
    const response = await academicApiFetch(AcademicScope.ADMIN, backendPath, { signal: request.signal });
    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "No se pudo obtener el conteo de cursos." }, { status: 503 });
  }
}
