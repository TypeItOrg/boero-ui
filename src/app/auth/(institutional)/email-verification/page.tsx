import type { Metadata } from "next";
import Image from "next/image";
import { Card, CardContent } from "@common/components/ui/card";
import { EmailVerificationForm } from "@features/institutional-auth/components/email-verification-form";
import { getEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";
export const metadata: Metadata = { title: "Verificación de correo electrónico", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function EmailVerificationPage(): Promise<React.ReactElement> {
  const context = await getEmailVerificationContext();
  return (
    <Card className="animate-fade-in-up p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <EmailVerificationForm context={context} />
        <section className="from-primary to-primary/80 relative hidden bg-linear-to-l p-8 md:flex md:items-center md:justify-center lg:p-12">
          <Image priority width={875} height={1202} src="/boero-logo.webp" alt="Logo de la institución" className="h-auto w-full max-w-56" />
        </section>
      </CardContent>
    </Card>
  );
}
