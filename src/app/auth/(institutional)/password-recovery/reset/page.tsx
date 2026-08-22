import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@common/components/ui/card";
import { ResetInstitutionalPasswordForm } from "@features/institutional-auth/components/reset-institutional-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Elegí una nueva contraseña para tu cuenta institucional",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}): Promise<React.ReactElement> {
  const { token } = await searchParams;
  if (token) {
    return (
      <Card className="animate-fade-in-up p-0">
        <CardContent className="p-0">
          <ResetInstitutionalPasswordForm token={token} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="space-y-4 p-6 text-center md:p-8">
        <h1 className="text-2xl font-bold">Enlace inválido</h1>
        <p className="text-muted-foreground text-sm">Solicitá un nuevo enlace de recuperación para continuar.</p>
        <Link className="text-primary font-medium underline underline-offset-4" href="/auth/password-recovery">
          Recuperar contraseña
        </Link>
      </CardContent>
    </Card>
  );
}


