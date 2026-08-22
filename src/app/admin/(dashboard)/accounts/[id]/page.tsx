import { notFound } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { PlatformAccountDetail } from "@features/platform-accounts/components/platform-account-detail";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { Metadata } from "next";

type PlatformAccountDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Detalle de cuenta",
};

export default async function PlatformAccountDetailPage({ params }: PlatformAccountDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const account = await fetchPlatformAccountAdmin(id);
  if (!account) notFound();
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title={fullName}
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      actions={
        <Button asChild size="lg">
          <ReturnToLink href={`/admin/accounts/${id}/edit`}>Editar cuenta</ReturnToLink>
        </Button>
      }
    >
      <PlatformAccountDetail account={account} />
    </PlatformPageShell>
  );
}
