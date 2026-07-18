export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <section className="w-full max-w-sm md:max-w-5xl">{children}</section>
    </main>
  );
}
