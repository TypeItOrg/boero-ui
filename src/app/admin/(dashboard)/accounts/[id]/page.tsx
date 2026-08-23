import Link from "next/link";
import { notFound } from "next/navigation";
import { FingerprintIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PlatformAccountDetail } from "@features/platform-accounts/components/platform-account-detail";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { Metadata } from "next";

type PlatformAccountDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export const metadata: Metadata = {
  title: "Detalle de cuenta",
};

export default async function PlatformAccountDetailPage({ params, searchParams }: PlatformAccountDetailPageProps): Promise<React.ReactElement> {
  const [{ id }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/admin/accounts");
  const account = await fetchPlatformAccountAdmin(id);
  if (!account) notFound();
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title={fullName}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <FingerprintIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
        <Button asChild size="lg">
          <ReturnToLink href={`/admin/accounts/${id}/edit`}>Editar cuenta</ReturnToLink>
        </Button>
      </div>
      <PlatformAccountDetail account={account} />
    </PlatformPageShell>
  );
}
