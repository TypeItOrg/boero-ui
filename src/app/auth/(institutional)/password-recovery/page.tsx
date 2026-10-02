import type { Metadata } from "next";
import { InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";

import { Card, CardContent } from "@common/components/ui/card";
import { InstitutionalPasswordRecoveryForm } from "@features/institutional-auth/components/institutional-password-recovery-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recuperá el acceso a tu cuenta institucional",
};

export default function PasswordRecoveryPage(): React.ReactElement {
  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <InstitutionalPasswordRecoveryForm />
        <InstitutionalBrandPanel showInstitutionName={false} />
      </CardContent>
    </Card>
  );
}
