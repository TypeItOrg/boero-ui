import { getRequestInstitution } from "@common/services/institutional-host/institutional-host.service";
import { InstitutionalBrandProvider } from "@features/institutional-auth/components/institutional-brand-context";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const institution = await getRequestInstitution();
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <section className="w-full max-w-sm md:max-w-5xl">
        <InstitutionalBrandProvider institution={institution}>{children}</InstitutionalBrandProvider>
      </section>
    </main>
  );
}
