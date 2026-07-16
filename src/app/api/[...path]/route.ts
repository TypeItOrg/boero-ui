import { COMMON_ERROR_MESSAGES } from "@common/constants/error-messages.constants";
import { proxyBoeroApiRequest } from "@common/services/proxy-boero-api-request.service";

type ApiProxyContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: Request, context: ApiProxyContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: ApiProxyContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PUT(request: Request, context: ApiProxyContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function PATCH(request: Request, context: ApiProxyContext): Promise<Response> {
  return proxyRequest(request, context);
}

export async function DELETE(request: Request, context: ApiProxyContext): Promise<Response> {
  return proxyRequest(request, context);
}

async function proxyRequest(request: Request, { params }: ApiProxyContext): Promise<Response> {
  try {
    const { path } = await params;
    return await proxyBoeroApiRequest(path, request);
  } catch (error) {
    console.error(error);

    return Response.json({ message: COMMON_ERROR_MESSAGES.UNEXPECTED_API_PROXY }, { status: 500 });
  }
}
