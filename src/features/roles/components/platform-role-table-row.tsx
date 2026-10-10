"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { KeyRoundIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { TableCell, TableRow } from "@common/components/ui/table";

import { PlatformRoleActions } from "@features/roles/components/platform-role-table-actions";
import type { PlatformRoleListItem } from "@features/roles/types/platform-role-list-item.types";

export function PlatformRoleTableRow({ role }: { role: PlatformRoleListItem }): ReactElement {
  return (
    <ContextMenu key={role.id}>
      <ContextMenuTrigger asChild>
        <TableRow>
          <TableCell className="w-16 pl-4">
            <PlatformRoleActions role={role} />
          </TableCell>
          <TableCell className="font-medium">
            <Link href={`/admin/roles/${role.id}`} className="hover:underline">
              {role.name}
            </Link>
          </TableCell>
          <TableCell>
            <Link href={`/admin/institutions/${role.institution.id}`} className="text-muted-foreground font-medium hover:underline">
              {role.institution.name}
            </Link>
            {!role.institution.active ? (
              <Badge variant="outline" className="ml-2">
                Inactiva
              </Badge>
            ) : null}
          </TableCell>
          <TableCell>
            <Badge variant={role.technicalCode ? "secondary" : "outline"}>{role.technicalCode ? "Sistema" : "Personalizado"}</Badge>
          </TableCell>
          <TableCell>{role.assignmentCount}</TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-1.5">
              <KeyRoundIcon className="text-muted-foreground size-4" />
              {role.permissionCount}
            </span>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 p-1.5">
        <ContextMenuGroup>
          <ContextMenuItem asChild>
            <Link href={`/admin/roles/${role.id}`} className="px-2.5 py-1.5">
              Ver detalle
            </Link>
          </ContextMenuItem>
          {role.editable ? (
            <ContextMenuItem asChild>
              <ReturnToLink href={`/admin/roles/${role.id}/edit`} className="px-2.5 py-1.5">
                Editar rol
              </ReturnToLink>
            </ContextMenuItem>
          ) : (
            <ContextMenuItem disabled className="px-2.5 py-1.5">
              Editar rol
            </ContextMenuItem>
          )}
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
