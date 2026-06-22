export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <main className="bg-muted min-h-svh p-6 md:p-10">{children}</main>;
}
