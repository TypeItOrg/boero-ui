import type { LucideIcon } from "lucide-react";

export function PlatformPageIcon({ icon: Icon }: { icon: LucideIcon }): React.ReactElement {
  return (
    <div
      data-slot="platform-page-icon"
      className="from-primary to-primary/80 text-primary-foreground hidden shrink-0 items-center justify-center rounded-2xl bg-linear-to-br shadow-xs sm:flex sm:aspect-square sm:h-full sm:w-auto"
    >
      <Icon className="size-6 sm:size-7" aria-hidden="true" />
    </div>
  );
}
