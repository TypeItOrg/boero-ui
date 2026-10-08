"use client";

import type { ReactElement } from "react";

import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";

export function PlatformAccountActions({ account }: { account: PlatformAccountAdmin }): ReactElement {
  const accountName = `${account.name} ${account.lastName}`;

  return (
    <div className="flex justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${accountName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <ReturnToLink href={`/admin/accounts/${account.platformAccountId}`} className="px-2.5 py-1.5">
                Ver detalle
              </ReturnToLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <ReturnToLink href={`/admin/accounts/${account.platformAccountId}/edit`} className="px-2.5 py-1.5">
                Editar
              </ReturnToLink>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
