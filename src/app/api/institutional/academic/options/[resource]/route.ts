import { proxyAcademicOptionsGet } from "@features/academic/services/proxy-academic-options-get.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }): Promise<Response> {
  const { resource } = await params;
  return proxyAcademicOptionsGet(request, resource, AcademicScope.INSTITUTIONAL);
}
