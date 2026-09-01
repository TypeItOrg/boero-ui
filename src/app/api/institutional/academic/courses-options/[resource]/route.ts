import { proxyCourseOptionsGet } from "@features/academic/services/proxy-course-options-get.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }): Promise<Response> {
  const { resource } = await params;
  return proxyCourseOptionsGet(request, resource, AcademicScope.INSTITUTIONAL);
}
