import { notFound } from "next/navigation";
import { FingerprintIcon } from "lucide-react";

import { isHttpStatusError } from "@common/utils/create-http-error.util";
import { PlatformAccountForm } from "@features/platform-accounts/components/platform-account-form";
import { fetchPlatformAccountAdmin } from "@features/platform-accounts/services/fetch-platform-account.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditPlatformAccountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPlatformAccountPage({
  params,
}: EditPlatformAccountPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const account = await getAccountOrNotFound(id);
  const fullName = `${account.name} ${account.lastName}`;

  return (
    <PlatformPageShell
      title="Editar administrador"
      description={`Actualizá la identidad y las credenciales de ${fullName}.`}
      minViewportHeight
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ [id]: fullName }} />}
      headerClassName="flex-row items-end justify-between"
      actions={
        <div className="from-primary to-primary/80 text-primary-foreground flex size-14 items-center justify-center rounded-xl bg-gradient-to-br shadow-xs">
          <FingerprintIcon className="size-7" aria-hidden="true" />
        </div>
      }
    >
      <PlatformAccountForm mode="edit" account={account} />
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
