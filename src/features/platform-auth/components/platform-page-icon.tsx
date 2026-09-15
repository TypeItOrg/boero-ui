import type { LucideIcon } from "lucide-react";

export function PlatformPageIcon({ icon: Icon }: { icon: LucideIcon }): React.ReactElement {
  return (
    <div
      data-slot="platform-page-icon"
      className="from-primary to-primary/80 text-primary-foreground hidden size-15 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br shadow-xs @2xl/page-shell:flex"
    >
      <Icon className="size-7" aria-hidden="true" />
    </div>
  );
}
