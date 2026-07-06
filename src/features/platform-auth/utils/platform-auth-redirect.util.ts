import { redirect } from "next/navigation";

import { getSafeNextPath } from "@features/platform-auth/utils/platform-auth-paths.util";

export function redirectToNext(next: string | null | undefined): never {
  redirect(getSafeNextPath(next));
}
