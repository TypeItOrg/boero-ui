import { InstitutionalUserProvider } from "@features/institutional-auth/components/institutional-user-provider";
import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

export default async function InstitutionalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.ReactElement> {
  const user = await getInstitutionalUser();

  return <InstitutionalUserProvider initialUser={user}>{children}</InstitutionalUserProvider>;
}
