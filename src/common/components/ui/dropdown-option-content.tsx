import type { ReactElement } from "react";

export function DropdownOptionContent({ label, description }: { label: string; description?: string }): ReactElement {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
      <span className="text-sm leading-5 font-medium break-words whitespace-normal">{label}</span>
      {description ? <span className="text-muted-foreground text-xs leading-4 break-words whitespace-normal">{description}</span> : null}
    </span>
  );
}
