"use client";

import Link from "next/link";
import { UserRoundIcon, UsersRoundIcon } from "lucide-react";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@common/components/ui/dropdown-menu";
import { GUARDIAN_DEPENDENTS_PAGE_PATH } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { useGuardianWorkspace } from "@features/guardian-workspace/components/guardian-workspace-provider";

export function GuardianWorkspaceMenuItems(): React.ReactElement {
  const { dependents, activeDependent, error, isPending, selectDependent } = useGuardianWorkspace();

  if (dependents.length === 0) {
    return (
      <>
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={GUARDIAN_DEPENDENTS_PAGE_PATH}>
            <UsersRoundIcon />
            Agregar persona a cargo
          </Link>
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      <DropdownMenuLabel>Trabajando con</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={activeDependent?.dependentPersonId ?? ""} onValueChange={selectDependent}>
        {dependents.map((dependent) => (
          <DropdownMenuRadioItem disabled={isPending} key={dependent.dependentPersonId} value={dependent.dependentPersonId}>
            <UserRoundIcon />
            <span className="min-w-0">
              <span className="block truncate">{getGuardianDependentName(dependent)}</span>
              <span className="text-muted-foreground block text-xs">DNI {dependent.documentNumber}</span>
            </span>
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
      {error ? <p className="text-destructive px-1.5 py-1 text-xs">{error}</p> : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={GUARDIAN_DEPENDENTS_PAGE_PATH}>
          <UsersRoundIcon />
          Gestionar personas a cargo
        </Link>
      </DropdownMenuItem>
    </>
  );
}
