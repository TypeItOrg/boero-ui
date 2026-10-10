"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import type { PlatformRoleListItem } from "@features/roles/types/platform-role-list-item.types";

export function PlatformRoleActions({ role }: { role: PlatformRoleListItem }): ReactElement {
  return (
    <div className="flex justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${role.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href={`/admin/roles/${role.id}`} className="px-2.5 py-1.5">
                Ver detalle
              </Link>
            </DropdownMenuItem>
            {role.editable ? (
              <DropdownMenuItem asChild>
                <ReturnToLink href={`/admin/roles/${role.id}/edit`} className="px-2.5 py-1.5">
                  Editar rol
                </ReturnToLink>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="px-2.5 py-1.5">
                Editar rol
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
