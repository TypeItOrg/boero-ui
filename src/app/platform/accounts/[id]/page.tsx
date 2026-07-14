import { notFound } from "next/navigation";

import { Button } from "@common/components/ui/button";
import { NavigationLink } from "@common/components/ui/navigation-link";
import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { PlatformAccountDetail } from "@features/platform-accounts/components/platform-account-detail";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

type PlatformAccountDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformAccountDetailPage({
  params,
}: PlatformAccountDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const [account, currentAccount] = await Promise.all([getAccountOrNotFound(id), getPlatformAccount()]);
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title={fullName}
      description="Consultá la identidad, el rol y el estado de acceso de esta cuenta."
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      actions={
        <Button asChild size="lg">
          <NavigationLink href={`/platform/accounts/${id}/edit`}>Editar cuenta</NavigationLink>
        </Button>
      }
    >
      <PlatformAccountDetail account={account} currentAccountId={currentAccount?.platformAccountId} />
    </PlatformPageShell>
  );
}

async function getAccountOrNotFound(id: string): Promise<Awaited<ReturnType<typeof fetchPlatformAccountAdmin>>> {
  try {
    return await fetchPlatformAccountAdmin(id);
  } catch (error) {
    if (isHttpStatusError(error, 404)) {
      notFound();
    }

    throw error;
  }
}
