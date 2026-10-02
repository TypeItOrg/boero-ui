import type { Metadata } from "next";
import { InstitutionalBrandPanel, InstitutionalBrandIdentity } from "@features/institutional-auth/components/institutional-brand-identity";
import Link from "next/link";

import { Card, CardContent } from "@common/components/ui/card";
import { ResetInstitutionalPasswordForm } from "@features/institutional-auth/components/reset-institutional-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  description: "Elegí una nueva contraseña para tu cuenta institucional",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }): Promise<React.ReactElement> {
  const { token } = await searchParams;
  if (token) {
    return (
      <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
        <CardContent className="grid-cols-2 p-0 md:grid">
          <ResetInstitutionalPasswordForm token={token} />
          <InstitutionalBrandPanel showInstitutionName={false} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-md p-0">
      <CardContent className="flex flex-col items-center space-y-4 p-6 text-center md:p-8">
        <InstitutionalBrandIdentity
          className="w-full"
          imageContainerClassName="size-20"
          imageClassName="max-h-20 max-w-20"
          showInstitutionName={false}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Enlace inválido</h1>
          <p className="text-muted-foreground text-sm">Solicitá un nuevo enlace de recuperación para continuar.</p>
        </div>
        <Link className="text-primary font-medium underline underline-offset-4" href="/auth/password-recovery">
          Recuperar contraseña
        </Link>
      </CardContent>
    </Card>
  );
}
