import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@common/components/ui/card";
import { getPlatformAccount } from "@features/platform-auth/services/platform-auth-services";

export default async function PlatformDashboardPage() {
  const account = await getPlatformAccount();

  if (!account) {
    redirect("/auth/platform/login");
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Usuario logueado</p>
            <h1 className="text-2xl font-semibold">
              {account.name} {account.lastName}
            </h1>
          </div>

          <dl className="grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{account.email}</dd>
            </div>
            <div className="rounded-lg border p-3">
              <dt className="text-muted-foreground">ID de cuenta</dt>
              <dd className="font-medium break-all">{account.platformAccountId}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
