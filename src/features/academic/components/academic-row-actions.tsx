import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { ContextMenuContent, ContextMenuItem } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { ACADEMIC_LIFECYCLE_ACTION_KIND, type AcademicLifecycleActionKind } from "@features/academic/types/academic-lifecycle-action-kind.types";
import { ACADEMIC_ROW_ACTION_KIND } from "@features/academic/types/academic-row-action-kind.types";
import type { AcademicRowAction } from "@features/academic/types/academic-row-action.types";
import { isDestructiveStatusAction } from "@features/academic/utils/academic-row-actions.util";

type AcademicStatusAction = Extract<AcademicRowAction, { kind: typeof ACADEMIC_ROW_ACTION_KIND.STATUS }>;

type AcademicActionProps = {
  actions: readonly AcademicRowAction[];
  onLifecycleAction: (kind: AcademicLifecycleActionKind) => void;
  onStatusAction: (action: AcademicStatusAction) => void;
};

export function AcademicContextMenuActions({ actions, onLifecycleAction, onStatusAction }: AcademicActionProps): React.ReactNode {
  return actions.map((action) => {
    if (action.kind === ACADEMIC_ROW_ACTION_KIND.NAVIGATE) {
      return (
        <ContextMenuItem key={action.href} asChild>
          <AcademicActionLink action={action} className="px-2.5 py-1.5" />
        </ContextMenuItem>
      );
    }

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.STATUS) {
      return (
        <ContextMenuItem
          key={action.label}
          variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
          className="px-2.5 py-1.5"
          onSelect={() => onStatusAction(action)}
        >
          {action.label}
        </ContextMenuItem>
      );
    }

    return (
      <ContextMenuItem
        key={action.label}
        className={action.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"}
        onSelect={() => onLifecycleAction(action.kind)}
      >
        {action.label}
      </ContextMenuItem>
    );
  });
}

export function AcademicRowActions({
  actions,
  label,
  onLifecycleAction,
  onStatusAction,
}: AcademicActionProps & { label: string }): React.ReactElement {
  if (actions.length === 0) return <div className="h-9" />;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${label}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <AcademicDropdownActions actions={actions} onLifecycleAction={onLifecycleAction} onStatusAction={onStatusAction} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AcademicDropdownActions({ actions, onLifecycleAction, onStatusAction }: AcademicActionProps): React.ReactNode {
  return actions.map((action) => {
    if (action.kind === ACADEMIC_ROW_ACTION_KIND.NAVIGATE) {
      return (
        <DropdownMenuItem key={action.href} asChild>
          <AcademicActionLink action={action} className="px-2.5 py-1.5" />
        </DropdownMenuItem>
      );
    }

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.STATUS) {
      return (
        <DropdownMenuItem
          key={action.label}
          variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
          className="px-2.5 py-1.5"
          onSelect={() => onStatusAction(action)}
        >
          {action.label}
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuItem
        key={action.label}
        className={action.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"}
        onSelect={() => onLifecycleAction(action.kind)}
      >
        {action.label}
      </DropdownMenuItem>
    );
  });
}

type AcademicActionLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  action: Extract<AcademicRowAction, { kind: typeof ACADEMIC_ROW_ACTION_KIND.NAVIGATE }>;
};

export const AcademicActionLink = React.forwardRef<HTMLAnchorElement, AcademicActionLinkProps>(function AcademicActionLink(
  { action, ...props },
  ref,
): React.ReactElement {
  if (action.preserveReturnTo) {
    return (
      <ReturnToLink ref={ref} href={action.href} {...props}>
        {action.label}
      </ReturnToLink>
    );
  }

  return (
    <Link ref={ref} href={action.href} {...props}>
      {action.label}
    </Link>
  );
});
AcademicActionLink.displayName = "AcademicActionLink";
