import { NextResponse } from "next/server";
import { publicApiFetch } from "@common/services/public-api-fetch.service";
import { isValidUuid } from "@common/utils/uuid.util";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

function unavailable(status = 503): Response {
  return NextResponse.json({ message: "Logo no disponible." }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ institutionId: string }> }): Promise<Response> {
  const { institutionId } = await params;
  if (!isValidUuid(institutionId)) {
    return unavailable(404);
  }

  try {
    const version = new URL(request.url).searchParams.get("v");
    const response = await publicApiFetch(`/api/v1/institutions/${institutionId}/logo${version ? `?v=${encodeURIComponent(version)}` : ""}`);
    if (!response.ok) {
      return unavailable(response.status === 404 ? 404 : 503);
    }

    const type = response.headers.get("content-type")?.split(";")[0];
    const declaredSize = Number(response.headers.get("content-length"));
    if (!response.body || !type || !["image/png", "image/jpeg"].includes(type) || declaredSize > MAX_LOGO_BYTES) {
      await response.body?.cancel();
      return unavailable();
    }

    const reader = response.body.getReader();
    const initialChunks: Uint8Array[] = [];
    let initialSize = 0;
    let complete = false;
    while (initialSize < 8 && !complete) {
      const chunk = await reader.read();
      complete = chunk.done;
      if (chunk.value) {
        initialChunks.push(chunk.value);
        initialSize += chunk.value.byteLength;
      }
    }
    if (initialSize > MAX_LOGO_BYTES) {
      await reader.cancel();
      return unavailable();
    }
    const signature = new Uint8Array(initialSize);
    let offset = 0;
    for (const chunk of initialChunks) {
      signature.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const validSignature =
      type === "image/png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => signature[index] === byte)
        : signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
    if (!validSignature || initialSize > MAX_LOGO_BYTES) {
      await reader.cancel();
      return unavailable();
    }

    let total = initialSize;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of initialChunks) {
          controller.enqueue(chunk);
        }
        if (complete) {
          controller.close();
        }
      },
      async pull(controller) {
        if (complete) {
          return;
        }
        try {
          const chunk = await reader.read();
          if (chunk.done) {
            complete = true;
            controller.close();
            return;
          }
          total += chunk.value.byteLength;
          if (total > MAX_LOGO_BYTES) {
            await reader.cancel();
            controller.error(new Error("Logo size limit exceeded"));
            return;
          }
          controller.enqueue(chunk.value);
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        return reader.cancel();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return unavailable();
  }
}
