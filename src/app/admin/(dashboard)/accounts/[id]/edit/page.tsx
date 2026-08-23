import { notFound } from "next/navigation";
import Link from "next/link";
import { FingerprintIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PlatformAccountForm } from "@features/platform-accounts/components/platform-account-form";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditPlatformAccountPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export default async function EditPlatformAccountPage({ params, searchParams }: EditPlatformAccountPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, `/admin/accounts/${id}`);
  const account = await fetchPlatformAccountAdmin(id);
  if (!account) notFound();
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title="Editar administrador"
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <FingerprintIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      }
    >
      <div>
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
      </div>
      <PlatformAccountForm mode="edit" account={account} returnTo={destination} />
    </PlatformPageShell>
  );
}
