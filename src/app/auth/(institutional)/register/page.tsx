import type { ReactElement } from "react";

import type { Metadata } from "next";

import { Card, CardContent } from "@common/components/ui/card";

import { InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";
import { InstitutionalRegisterForm } from "@features/institutional-auth/components/institutional-register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate en tu institución",
};

export default function RegisterPage(): ReactElement {
  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalRegisterForm />
        <InstitutionalBrandPanel showInstitutionName={false} />
      </CardContent>
    </Card>
  );
}
