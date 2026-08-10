import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function GET(): Promise<Response> {
  const account = await getPlatformAccount();
  return Response.json(account, { headers: { "Cache-Control": "private, no-store" } });
}
