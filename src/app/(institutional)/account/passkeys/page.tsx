import type { Metadata } from "next";

import { InstitutionalAccountHeader } from "@features/institutional-auth/components/institutional-account-header";
import { PasskeyManager } from "@features/institutional-auth/components/passkey-manager";
import { fetchPasskeys } from "@features/institutional-auth/services/fetch-passkeys.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Llaves de acceso");
}

export default async function PasskeysPage(): Promise<React.ReactElement> {
  const { passkeys, maxActivePasskeys } = await fetchPasskeys();

  return (
    <>
      <InstitutionalAccountHeader />
      <PasskeyManager initialPasskeys={passkeys} maxActivePasskeys={maxActivePasskeys} />
    </>
  );
}
