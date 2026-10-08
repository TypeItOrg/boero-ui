import type { ReactElement } from "react";

import type { Metadata } from "next";

import { Card, CardContent } from "@common/components/ui/card";

import { ConfirmEmailVerificationForm } from "@features/institutional-auth/components/confirm-email-verification-form";
import { InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";
import { confirmEmailSchema } from "@features/institutional-auth/schemas/email-verification.schema";

export const metadata: Metadata = {
  title: "Verificación de correo electrónico",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function EmailVerificationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }): Promise<ReactElement> {
  const parsed = confirmEmailSchema.safeParse(await searchParams);
  const token = parsed.success ? parsed.data.token : undefined;

  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <ConfirmEmailVerificationForm token={token} />
        <InstitutionalBrandPanel showInstitutionName={false} />
      </CardContent>
    </Card>
  );
}
