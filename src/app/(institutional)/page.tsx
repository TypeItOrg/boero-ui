import { InstitutionalUserCard } from "@features/institutional-auth/components/institutional-user-card";

export default function Home(): React.ReactElement {
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <InstitutionalUserCard />
    </main>
  );
}
