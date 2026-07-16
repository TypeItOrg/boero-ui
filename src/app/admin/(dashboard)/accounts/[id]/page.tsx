import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { PlatformAccountDetail } from "@features/platform-accounts/components/platform-account-detail";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type PlatformAccountDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformAccountDetailPage({
  params,
}: PlatformAccountDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const account = await fetchPlatformAccountAdmin(id);
  if (!account) notFound();
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title={fullName}
      description="Consultá la identidad, el rol y el estado de acceso de esta cuenta."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      actions={
        <Button asChild size="lg">
          <Link href={`/admin/accounts/${id}/edit`}>Editar cuenta</Link>
        </Button>
      }
    >
      <PlatformAccountDetail account={account} />
    </PlatformPageShell>
  );
}
