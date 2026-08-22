import { UserPlusIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { PlatformAccountForm } from "@features/platform-accounts/components/platform-account-form";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nuevo administrador",
  description: "Creá un nuevo administrador para la plataforma.",
};

export default async function NewPlatformAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/admin/accounts");
  return (
    <PlatformPageShell
      title="Nuevo administrador"
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <UserPlusIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <PlatformAccountForm mode="create" returnTo={destination} />
    </PlatformPageShell>
  );
}
