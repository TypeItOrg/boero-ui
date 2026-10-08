import type { Metadata } from "next";
import { InstitutionalBrandPanel } from "@features/institutional-auth/components/institutional-brand-identity";
import { Card, CardContent } from "@common/components/ui/card";
import { EmailVerificationForm } from "@features/institutional-auth/components/email-verification-form";
import { getEmailVerificationContext } from "@features/institutional-auth/utils/email-verification-context.util";
export const metadata: Metadata = { title: "Verificación de correo electrónico", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function EmailVerificationPage(): Promise<React.ReactElement> {
  const context = await getEmailVerificationContext();
  return (
    <Card className="animate-fade-in-up mx-auto w-full max-w-240 p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <EmailVerificationForm context={context} />
        <InstitutionalBrandPanel showInstitutionName={false} />
      </CardContent>
    </Card>
  );
}
