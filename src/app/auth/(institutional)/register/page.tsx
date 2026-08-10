import type { Metadata } from "next";
import Image from "next/image";

import { Card, CardContent } from "@common/components/ui/card";
import { InstitutionalRegisterForm } from "@features/institutional-auth/components/institutional-register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate en tu institución",
};

export default function RegisterPage(): React.ReactElement {
  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalRegisterForm />
        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l md:flex md:items-center md:justify-center">
          <Image
            priority
            width={875}
            height={1202}
            src="/boero-logo.webp"
            alt="Logo de la institución"
            className="h-auto w-56"
          />
        </section>
      </CardContent>
    </Card>
  );
}
