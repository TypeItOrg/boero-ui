import { InstitutionalRouteLayout } from "@features/institutional-auth/components/institutional-route-layout";

export default async function InstitutionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  return <InstitutionalRouteLayout>{children}</InstitutionalRouteLayout>;
}
