import type { PropsWithChildren, ReactElement } from "react";

import { type LucideIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";

export function PersonFormCard({ children }: PropsWithChildren): ReactElement {
  return <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">{children}</div>;
}

export function PersonFormSectionHeading({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }): ReactElement {
  return (
    <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
      <SectionHeader icon={Icon} title={title} description={description} />
    </header>
  );
}
