import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent } from "@common/components/ui/card";
import { InstitutionalLoginForm } from "@features/institutional-auth/components/institutional-login-form";
import {
  hasInstitutionalPasswordChangedCookie,
  hasInstitutionalRegistrationSuccessCookie,
} from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Iniciá sesión en tu institución",
};

export default async function LoginPage(): Promise<React.ReactElement> {
  const [registered, passwordChanged] = await Promise.all([hasInstitutionalRegistrationSuccessCookie(), hasInstitutionalPasswordChangedCookie()]);

  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalLoginForm registered={registered} passwordChanged={passwordChanged} />
        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l md:flex md:items-center md:justify-center">
          <Image priority width={875} height={1202} src={"/boero-logo.webp"} alt={"Logo de la institución"} className="h-auto w-56" />
        </section>
      </CardContent>
    </Card>
  );
}
