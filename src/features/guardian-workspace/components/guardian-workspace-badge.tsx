"use client";

import { UserRoundIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { useGuardianWorkspace } from "@features/guardian-workspace/components/guardian-workspace-provider";

export function GuardianWorkspaceBadge(): React.ReactElement | null {
  const { dependents, activeDependent } = useGuardianWorkspace();

  if (dependents.length === 0) {
    return null;
  }

  if (!activeDependent) {
    return (
      <Badge variant="outline" size="lg" className="max-w-40 shrink-0 sm:max-w-none">
        <UserRoundIcon />
        Sin persona seleccionada
      </Badge>
    );
  }

  const fullName = getGuardianDependentName(activeDependent);
  const roleLabel = activeDependent.roles.join(", ");

  return (
    <Badge
      variant="secondary"
      size="lg"
      className="max-w-40 shrink-0 sm:max-w-64"
      title={roleLabel ? `Trabajando con ${fullName} · ${roleLabel}` : `Trabajando con ${fullName}`}
    >
      <UserRoundIcon />
      <span className="truncate">{fullName}</span>
      {roleLabel ? <span className="text-muted-foreground hidden font-normal sm:inline">· {roleLabel}</span> : null}
    </Badge>
  );
}
