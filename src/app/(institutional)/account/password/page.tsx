import type { Metadata } from "next";

import { InstitutionalAccountHeader } from "@features/institutional-auth/components/institutional-account-header";
import { InstitutionalPasswordForm } from "@features/institutional-auth/components/institutional-password-form";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Contraseña");
}

export default function PasswordPage(): React.ReactElement {
  return (
    <>
      <InstitutionalAccountHeader />
      <InstitutionalPasswordForm />
    </>
  );
}
