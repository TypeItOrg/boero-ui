import type { ReactElement } from "react";

import { type LucideIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

export function DashboardEmptyState({ icon: Icon, title, description }: DashboardEmptyStateProps): ReactElement {
  return (
    <Empty className="bg-muted/25 mt-4 min-h-56 rounded-xl border border-solid p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};
