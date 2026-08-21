import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon, UserIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@common/components/ui/avatar";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

type InstitutionsTableRowProps = {
  institution: InstitutionSummary;
  onStatusChange: (institution: InstitutionSummary) => void;
};

type InstitutionAction = {
  href: string;
  label: string;
  preserveReturnTo?: boolean;
};

export function InstitutionsTableRow({ institution, onStatusChange }: InstitutionsTableRowProps): React.ReactElement {
  const actions = getInstitutionActions(institution);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow>
          <TableCell className="font-medium">
            <Link className="hover:underline" href={`/admin/institutions/${institution.id}`}>
              {institution.name}
            </Link>
          </TableCell>
          <TableCell>{institution.country.name}</TableCell>
          <TableCell>{institution.province}</TableCell>
          <TableCell>{institution.city}</TableCell>
          <TableCell>
            <InstitutionUsersCell institution={institution} />
          </TableCell>
          <TableCell>
            <Badge variant={institution.active ? "success" : "destructive"}>{institution.active ? "Activa" : "Inactiva"}</Badge>
          </TableCell>
          <TableCell className="pr-4">
            <InstitutionActionsMenu institution={institution} onStatusChange={() => onStatusChange(institution)} />
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1.5">
        {actions.map((action) => (
          <ContextMenuItem key={action.href} asChild>
            {action.preserveReturnTo ? (
              <ReturnToLink href={action.href} className="px-2.5 py-1.5">
                {action.label}
              </ReturnToLink>
            ) : (
              <Link href={action.href} className="px-2.5 py-1.5">
                {action.label}
              </Link>
            )}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        <ContextMenuItem
          variant={institution.active ? "destructive" : "default"}
          className="px-2.5 py-1.5"
          onSelect={() => onStatusChange(institution)}
        >
          {institution.active ? "Desactivar" : "Activar"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function getInstitutionActions(institution: InstitutionSummary): InstitutionAction[] {
  const detailHref = `/admin/institutions/${institution.id}`;
  if (!institution.active) return [{ label: "Ver", href: detailHref }];

  return [
    { label: "Ver", href: detailHref },
    { label: "Editar", href: `${detailHref}/edit`, preserveReturnTo: true },
    { label: "Usuarios", href: `${detailHref}/people` },
  ];
}

function InstitutionUsersCell({ institution }: { institution: InstitutionSummary }): React.ReactElement {
  const count = Number.isFinite(institution.userCount) ? institution.userCount : 0;
  if (count === 0) return <span className="text-muted-foreground/60">Sin usuarios</span>;

  const visibleAvatars = Math.min(count, 3);
  const overflow = count - visibleAvatars;

  return (
    <Link href={`/admin/institutions/${institution.id}/people`} className="inline-flex items-center">
      <AvatarGroup>
        {Array.from({ length: visibleAvatars }).map((_, index) => (
          <Avatar key={index} size="sm">
            <AvatarFallback>
              <UserIcon className="size-3" />
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
      </AvatarGroup>
    </Link>
  );
}

function InstitutionActionsMenu({
  institution,
  onStatusChange,
}: {
  institution: InstitutionSummary;
  onStatusChange: () => void;
}): React.ReactElement {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${institution.name}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          <DropdownMenuGroup>
            {getInstitutionActions(institution).map((action) => (
              <DropdownMenuItem key={action.href} asChild>
                {action.preserveReturnTo ? (
                  <ReturnToLink href={action.href} className="px-2.5 py-1.5">
                    {action.label}
                  </ReturnToLink>
                ) : (
                  <Link href={action.href} className="px-2.5 py-1.5">
                    {action.label}
                  </Link>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant={institution.active ? "destructive" : "default"} className="px-2.5 py-1.5" onSelect={onStatusChange}>
            {institution.active ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
