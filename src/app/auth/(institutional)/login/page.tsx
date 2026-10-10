import type { ReactElement } from "react";

import type { Metadata } from "next";

import { Card, CardContent } from "@common/components/ui/card";

import { InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";
import { InstitutionalLoginForm } from "@features/institutional-auth/components/institutional-login-form";
import {
  hasInstitutionalEmailVerifiedCookie,
  hasInstitutionalPasswordChangedCookie,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión en tu institución",
};

export default async function LoginPage(): Promise<ReactElement> {
  const [emailVerified, passwordChanged] = await Promise.all([hasInstitutionalEmailVerifiedCookie(), hasInstitutionalPasswordChangedCookie()]);

  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalLoginForm emailVerified={emailVerified} passwordChanged={passwordChanged} />
        <InstitutionalBrandPanel showInstitutionName={false} />
      </CardContent>
    </Card>
  );
}
