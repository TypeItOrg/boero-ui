import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardContent } from "@common/components/ui/card";
import { ConfirmEmailVerificationForm } from "@features/institutional-auth/components/confirm-email-verification-form";
import { confirmEmailSchema } from "@features/institutional-auth/schemas/email-verification.schema";
export const metadata: Metadata = { title: "Verificación de correo electrónico", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function EmailVerificationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }): Promise<React.ReactElement> {
  const parsed = confirmEmailSchema.safeParse(await searchParams);
  const token = parsed.success ? parsed.data.token : undefined;
  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <ConfirmEmailVerificationForm token={token} />
        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l p-8 md:flex md:items-center md:justify-center lg:p-12">
          <Image priority width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-full max-w-56" />
        </section>
      </CardContent>
    </Card>
  );
}
