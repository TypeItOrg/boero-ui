import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent } from "@common/components/ui/card";
import { InstitutionalPasswordRecoveryForm } from "@features/institutional-auth/components/institutional-password-recovery-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recuperá el acceso a tu cuenta institucional",
};

export default function PasswordRecoveryPage(): React.ReactElement {
  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalPasswordRecoveryForm />
        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l md:flex md:items-center md:justify-center">
          <Image priority width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-56" />
        </section>
      </CardContent>
    </Card>
  );
}
