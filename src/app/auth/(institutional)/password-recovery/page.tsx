import type { Metadata } from "next";

import { Card, CardContent } from "@common/components/ui/card";
import { InstitutionalPasswordRecoveryForm } from "@features/institutional-auth/components/institutional-password-recovery-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  description: "Recuperá el acceso a tu cuenta institucional",
};

export default function PasswordRecoveryPage(): React.ReactElement {
  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="p-0">
        <InstitutionalPasswordRecoveryForm />
      </CardContent>
    </Card>
  );
}


