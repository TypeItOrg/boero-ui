import * as React from "react";
import Link from "next/link";
import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@common/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { PersonSummary } from "@features/people/types/person-summary.types";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PeopleTableRowProps = {
  canDelete: boolean;
  canManageRoles: boolean;
  canUpdate: boolean;
  canUpdateStatus: boolean;
  institutionId: string;
  onDelete: (person: PersonSummary) => void;
  onUpdateStatus: (person: PersonSummary) => void;
  person: PersonSummary;
  scope: PeopleScopeType;
  selfPersonId?: string | null;
};

export function PeopleTableRow({
  canDelete,
  canManageRoles,
  canUpdate,
  canUpdateStatus,
  institutionId,
  onDelete,
  onUpdateStatus,
  person,
  scope,
  selfPersonId,
}: PeopleTableRowProps): React.ReactElement {
  const isSelf = person.id === selfPersonId;
  const personHref = getPersonHref(scope, institutionId, person.id, selfPersonId);
  const canEditPerson = canUpdate;
  const canOpenPerson = canEditPerson || (PeopleScope.isInstitutional(scope) && canManageRoles && !isSelf);
  const canDeletePerson = canDelete && !isSelf;
  const canUpdatePersonStatus = canUpdateStatus && !isSelf;
  const hasActions = canOpenPerson || canDeletePerson || canUpdatePersonStatus;

  const tableRow = (
    <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
      <TableCell className="font-medium">
        {canOpenPerson ? (
          <PersonNavigationLink className="hover:underline" href={personHref}>
            {person.lastName}, {person.firstName}
          </PersonNavigationLink>
        ) : (
          <span>
            {person.lastName}, {person.firstName}
          </span>
        )}
      </TableCell>
      <TableCell>{person.documentNumber}</TableCell>
      <TableCell>
        {person.phoneNumber ? person.phoneNumber : <span className="text-muted-foreground/60">Sin teléfono</span>}
      </TableCell>
      <TableCell>{person.email ? person.email : <span className="text-muted-foreground/60">Sin email</span>}</TableCell>
      {PeopleScope.isInstitutional(scope) ? (
        <TableCell>
          <Badge variant={person.enabled ? "secondary" : "outline"}>{person.enabled ? "Activo" : "Inactivo"}</Badge>
        </TableCell>
      ) : null}
      <TableCell>
        {person.roles && person.roles.length > 0 ? (
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
      <TableCell>
        {hasActions ? (
          <PersonActionsMenu
            person={person}
            institutionId={institutionId}
            scope={scope}
            isSelf={isSelf}
            canEdit={canOpenPerson}
            editLabel={canEditPerson ? "Editar" : "Administrar"}
            canDelete={canDeletePerson}
            canUpdateStatus={canUpdatePersonStatus}
            onDelete={() => onDelete(person)}
            onUpdateStatus={() => onUpdateStatus(person)}
          />
        ) : null}
      </TableCell>
    </TableRow>
  );

  if (!hasActions) return tableRow;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tableRow}</ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1.5">
        {canOpenPerson ? (
          <ContextMenuItem asChild>
            <PersonNavigationLink href={personHref} className="px-2.5 py-1.5">
              {canEditPerson ? "Editar" : "Administrar"}
            </PersonNavigationLink>
          </ContextMenuItem>
        ) : null}
        {canUpdatePersonStatus ? (
          <ContextMenuItem className="px-2.5 py-1.5" onSelect={() => onUpdateStatus(person)}>
            {person.enabled ? "Desactivar acceso" : "Activar acceso"}
          </ContextMenuItem>
        ) : null}
        {canDeletePerson ? (
          <>
            {canOpenPerson || canUpdatePersonStatus ? <ContextMenuSeparator /> : null}
            <ContextMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onDelete(person)}>
              Eliminar
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}

type PersonActionsMenuProps = {
  canDelete: boolean;
  canEdit: boolean;
  canUpdateStatus: boolean;
  editLabel: string;
  institutionId: string;
  isSelf: boolean;
  onDelete: () => void;
  onUpdateStatus: () => void;
  person: PersonSummary;
  scope: PeopleScopeType;
};

function PersonActionsMenu({
  canDelete,
  canEdit,
  canUpdateStatus,
  editLabel,
  institutionId,
  isSelf,
  onDelete,
  onUpdateStatus,
  person,
  scope,
}: PersonActionsMenuProps): React.ReactElement {
  const personHref = getPersonHref(scope, institutionId, person.id, isSelf ? person.id : undefined);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${person.firstName} ${person.lastName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 p-1.5">
          {canEdit ? (
            <DropdownMenuItem asChild>
              <PersonNavigationLink href={personHref} className="px-2.5 py-1.5">
                {editLabel}
              </PersonNavigationLink>
            </DropdownMenuItem>
          ) : null}
          {canUpdateStatus ? (
            <DropdownMenuItem className="px-2.5 py-1.5" onSelect={onUpdateStatus}>
              {person.enabled ? "Desactivar acceso" : "Activar acceso"}
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              {canEdit || canUpdateStatus ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={onDelete}>
                Eliminar
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PersonNavigationLinkProps = React.ComponentProps<typeof Link> & {
  returnTo?: string;
};

const PersonNavigationLink = React.forwardRef<HTMLAnchorElement, PersonNavigationLinkProps>(
  function PersonNavigationLink({ href, children, returnTo, ...props }, ref): React.ReactElement {
    const hrefString = typeof href === "string" ? href : (href.pathname ?? "");
    if (hrefString === "/profile") {
      return (
        <Link ref={ref} href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <ReturnToLink ref={ref} href={hrefString} returnTo={returnTo} {...props}>
        {children}
      </ReturnToLink>
    );
  },
);
PersonNavigationLink.displayName = "PersonNavigationLink";

function getPersonHref(
  scope: PeopleScopeType,
  institutionId: string,
  personId: string,
  selfPersonId?: string | null,
): string {
  if (PeopleScope.isInstitutional(scope) && personId === selfPersonId) return "/profile";
  return PeopleScope.isInstitutional(scope)
    ? `/people/${personId}`
    : `/admin/institutions/${institutionId}/people/${personId}`;
}
