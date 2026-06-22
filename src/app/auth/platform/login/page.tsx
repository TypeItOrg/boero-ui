import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@common/components/ui/card";
import { getPlatformAccount } from "@features/platform-auth/utils/get-platform-account.util";
import { PlatformLoginForm } from "@features/platform-auth/components/platform-login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta",
};

export default async function LoginPage() {
  const account = await getPlatformAccount();

  if (account) {
    redirect("/platform/dashboard");
  }

  return (
    <Card className="p-0">
      <CardContent className="grid-cols-2 p-0 md:grid">
        <PlatformLoginForm />

        <section className="bg-muted relative hidden md:block">
          <Image
            alt="Login background"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            height={1200}
            loading="eager"
            priority
            src="https://ui.shadcn.com/placeholder.svg"
            width={1200}
          />
        </section>
      </CardContent>
    </Card>
  );
}
