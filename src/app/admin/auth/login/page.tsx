import type { Metadata } from "next";

import { Card, CardContent } from "@common/components/ui/card";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { PlatformLoginForm } from "@features/platform-auth/components/platform-login-form";
import { getSafeNextPath } from "@features/platform-auth/utils/platform-auth-paths.util";
import { redirectToNext } from "@features/platform-auth/utils/platform-auth-redirect.util";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta",
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }): Promise<React.ReactElement> {
  const account = await getPlatformAccount();
  const resolvedSearchParams = await searchParams;
  const next = resolvedSearchParams.next;
  const safeNext = getSafeNextPath(next);

  if (account) {
    redirectToNext(next);
  }

  return (
    <Card className="p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <PlatformLoginForm next={safeNext} />

        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l md:block"></section>
      </CardContent>
    </Card>
  );
}
