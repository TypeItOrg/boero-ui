import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { ContextMenuItem, ContextMenuSeparator } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
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
  const orderedActions = orderAcademicActions(actions);
  const sensitiveActionIndex = orderedActions.findIndex(isSensitiveAcademicAction);

  return orderedActions.map((action, index) => {
    const separator = index === sensitiveActionIndex && index > 0 ? <ContextMenuSeparator /> : null;

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.NAVIGATE) {
      return (
        <React.Fragment key={action.href}>
          {separator}
          <ContextMenuItem asChild>
            <AcademicActionLink action={action} className="px-2.5 py-1.5" />
          </ContextMenuItem>
        </React.Fragment>
      );
    }

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.STATUS) {
      return (
        <React.Fragment key={action.label}>
          {separator}
          <ContextMenuItem
            variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
            className="px-2.5 py-1.5"
            onSelect={() => onStatusAction(action)}
          >
            {action.label}
          </ContextMenuItem>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={action.label}>
        {separator}
        <ContextMenuItem
          className={
            action.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"
          }
          onSelect={() => onLifecycleAction(action.kind)}
        >
          {action.label}
        </ContextMenuItem>
      </React.Fragment>
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
    <div className="flex justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${label}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 p-1.5">
          <AcademicDropdownActions actions={actions} onLifecycleAction={onLifecycleAction} onStatusAction={onStatusAction} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AcademicDropdownActions({ actions, onLifecycleAction, onStatusAction }: AcademicActionProps): React.ReactNode {
  const orderedActions = orderAcademicActions(actions);
  const sensitiveActionIndex = orderedActions.findIndex(isSensitiveAcademicAction);

  return orderedActions.map((action, index) => {
    const separator = index === sensitiveActionIndex && index > 0 ? <DropdownMenuSeparator /> : null;

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.NAVIGATE) {
      return (
        <React.Fragment key={action.href}>
          {separator}
          <DropdownMenuItem asChild>
            <AcademicActionLink action={action} className="px-2.5 py-1.5" />
          </DropdownMenuItem>
        </React.Fragment>
      );
    }

    if (action.kind === ACADEMIC_ROW_ACTION_KIND.STATUS) {
      return (
        <React.Fragment key={action.label}>
          {separator}
          <DropdownMenuItem
            variant={isDestructiveStatusAction(action) ? "destructive" : "default"}
            className="px-2.5 py-1.5"
            onSelect={() => onStatusAction(action)}
          >
            {action.label}
          </DropdownMenuItem>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={action.label}>
        {separator}
        <DropdownMenuItem
          className={
            action.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE ? "text-destructive focus:text-destructive px-2.5 py-1.5" : "px-2.5 py-1.5"
          }
          onSelect={() => onLifecycleAction(action.kind)}
        >
          {action.label}
        </DropdownMenuItem>
      </React.Fragment>
    );
  });
}

function orderAcademicActions(actions: readonly AcademicRowAction[]): AcademicRowAction[] {
  return [...actions.filter((action) => !isSensitiveAcademicAction(action)), ...actions.filter(isSensitiveAcademicAction)];
}

function isSensitiveAcademicAction(action: AcademicRowAction): boolean {
  return (
    action.kind === ACADEMIC_LIFECYCLE_ACTION_KIND.DELETE || (action.kind === ACADEMIC_ROW_ACTION_KIND.STATUS && isDestructiveStatusAction(action))
  );
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
