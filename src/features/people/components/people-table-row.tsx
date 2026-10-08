import type { ReactElement } from "react";

import { Badge } from "@common/components/ui/badge";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { TableCell, TableRow } from "@common/components/ui/table";

import { PersonActionsMenu } from "@features/people/components/person-actions-menu";
import { PersonNavigationLink, getPersonHref } from "@features/people/components/person-navigation-link";
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
}: PeopleTableRowProps): ReactElement {
  const isSelf = person.id === selfPersonId;

  const personHref = getPersonHref(scope, institutionId, person.id, selfPersonId);

  const personDetailHref = getPersonHref(scope, institutionId, person.id, selfPersonId, true);

  const canEditPerson = canUpdate;

  const canDeletePerson = canDelete && !isSelf;

  const canUpdatePersonStatus = canUpdateStatus && !isSelf;

  const canEditOrManage = canEditPerson || (PeopleScope.isInstitutional(scope) && canManageRoles && !isSelf);

  const editLabel = canEditPerson ? "Editar" : "Administrar";

  const tableRow = (
    <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
      <TableCell className="w-16 pl-4">
        <PersonActionsMenu
          person={person}
          institutionId={institutionId}
          scope={scope}
          isSelf={isSelf}
          canEdit={canEditOrManage}
          editLabel={editLabel}
          canDelete={canDeletePerson}
          canUpdateStatus={canUpdatePersonStatus}
          onDelete={() => onDelete(person)}
          onUpdateStatus={() => onUpdateStatus(person)}
        />
      </TableCell>
      <TableCell className="font-medium">
        <PersonNavigationLink className="hover:underline" href={personDetailHref}>
          {person.lastName}, {person.firstName}
        </PersonNavigationLink>
      </TableCell>
      <TableCell>{person.documentNumber}</TableCell>
      <TableCell>{person.phoneNumber ? person.phoneNumber : <span className="text-muted-foreground/60">Sin teléfono</span>}</TableCell>
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
    </TableRow>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tableRow}</ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1.5">
        <ContextMenuItem asChild>
          <PersonNavigationLink href={personDetailHref} className="px-2.5 py-1.5">
            Ver detalle
          </PersonNavigationLink>
        </ContextMenuItem>
        {canEditOrManage ? (
          <ContextMenuItem asChild>
            <PersonNavigationLink href={personHref} className="px-2.5 py-1.5">
              {editLabel}
            </PersonNavigationLink>
          </ContextMenuItem>
        ) : null}
        {canUpdatePersonStatus && !person.enabled ? (
          <ContextMenuItem className="px-2.5 py-1.5" onSelect={() => onUpdateStatus(person)}>
            Activar acceso
          </ContextMenuItem>
        ) : null}
        {(canUpdatePersonStatus && person.enabled) || canDeletePerson ? <ContextMenuSeparator /> : null}
        {canUpdatePersonStatus && person.enabled ? (
          <ContextMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onUpdateStatus(person)}>
            Desactivar acceso
          </ContextMenuItem>
        ) : null}
        {canDeletePerson ? (
          <>
            <ContextMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onDelete(person)}>
              Eliminar
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}

PersonNavigationLink.displayName = "PersonNavigationLink";
