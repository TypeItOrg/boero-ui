import type { ReactElement } from "react";

import { Building2 } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { InstitutionForm } from "@features/institutions/components/institution-form";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nueva institución",
  description: "Creá una nueva institución en la plataforma.",
};

export default async function NewInstitutionPage({ searchParams }: { searchParams: Promise<{ returnTo?: QueryParamValue }> }): Promise<ReactElement> {
  const { returnTo } = await searchParams;

  const destination = getSafeReturnTo(returnTo, "/admin/institutions");

  return (
    <PlatformPageShell
      title="Nueva institución"
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ new: "Nueva" }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={Building2} />}
    >
      <InstitutionForm mode="create" returnTo={destination} />
    </PlatformPageShell>
  );
}
