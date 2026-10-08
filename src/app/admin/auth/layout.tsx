import type { ReactNode } from "react";

export default function PlatformAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <section className="w-full max-w-sm md:max-w-4xl">{children}</section>
    </main>
  );
}
