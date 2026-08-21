import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { PlatformPersonSummary } from "@features/people/types/platform-person-summary.types";

export function PlatformPeopleTableRow({ canUpdate, person }: { canUpdate: boolean; person: PlatformPersonSummary }): React.ReactElement {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className="h-11">
          <TableCell className="font-medium">
            {canUpdate ? (
              <ReturnToLink className="hover:underline" href={getPersonPath(person)}>
                {person.lastName}, {person.firstName}
              </ReturnToLink>
            ) : (
              <span>
                {person.lastName}, {person.firstName}
              </span>
            )}
          </TableCell>
          <TableCell>{person.documentNumber}</TableCell>
          <TableCell>
            <Link className="text-muted-foreground font-medium hover:underline" href={getInstitutionPath(person)}>
              {person.institutionName}
            </Link>
          </TableCell>
          <TableCell>{person.phoneNumber || <span className="text-muted-foreground/60">Sin teléfono</span>}</TableCell>
          <TableCell>{person.email || <span className="text-muted-foreground/60">Sin email</span>}</TableCell>
          <TableCell>
            {person.roles.length ? (
              <div className="flex flex-wrap gap-1">
                {person.roles.map((role) => (
                  <Badge key={role.roleCode} variant="secondary">
                    {role.displayName}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground/60">Sin rol</span>
            )}
          </TableCell>
          <TableCell className="pr-4">
            <PlatformPersonActions person={person} canUpdate={canUpdate} />
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1.5">
        <ContextMenuGroup>
          {canUpdate ? (
            <ContextMenuItem asChild>
              <ReturnToLink href={getPersonPath(person)} className="px-2.5 py-1.5">
                Editar usuario
              </ReturnToLink>
            </ContextMenuItem>
          ) : null}
          <ContextMenuItem asChild>
            <Link href={getInstitutionPath(person)} className="px-2.5 py-1.5">
              Ver institución
            </Link>
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function PlatformPersonActions({ person, canUpdate }: { person: PlatformPersonSummary; canUpdate: boolean }): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${person.firstName} ${person.lastName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            {canUpdate ? (
              <DropdownMenuItem asChild>
                <ReturnToLink href={getPersonPath(person)} className="px-2.5 py-1.5">
                  Editar usuario
                </ReturnToLink>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <Link href={getInstitutionPath(person)} className="px-2.5 py-1.5">
                Ver institución
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function getPersonPath(person: PlatformPersonSummary): string {
  return `/admin/institutions/${person.institutionId}/people/${person.id}`;
}

function getInstitutionPath(person: PlatformPersonSummary): string {
  return `/admin/institutions/${person.institutionId}`;
}
