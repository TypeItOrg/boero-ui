import type { ReactElement } from "react";

import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import { PersonNavigationLink, getPersonHref } from "@features/people/components/person-navigation-link";
import type { PersonSummary } from "@features/people/types/person-summary.types";
import { type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export function PersonActionsMenu({
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
}: PersonActionsMenuProps): ReactElement {
  const personHref = getPersonHref(scope, institutionId, person.id, isSelf ? person.id : undefined);

  const personDetailHref = getPersonHref(scope, institutionId, person.id, isSelf ? person.id : undefined, true);

  return (
    <div className="flex justify-start">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${person.firstName} ${person.lastName}`}>
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 p-1.5">
          <DropdownMenuItem asChild>
            <PersonNavigationLink href={personDetailHref} className="px-2.5 py-1.5">
              Ver detalle
            </PersonNavigationLink>
          </DropdownMenuItem>
          {canEdit ? (
            <DropdownMenuItem asChild>
              <PersonNavigationLink href={personHref} className="px-2.5 py-1.5">
                {editLabel}
              </PersonNavigationLink>
            </DropdownMenuItem>
          ) : null}
          {canUpdateStatus && !person.enabled ? (
            <DropdownMenuItem className="px-2.5 py-1.5" onSelect={onUpdateStatus}>
              Activar acceso
            </DropdownMenuItem>
          ) : null}
          {(canUpdateStatus && person.enabled) || canDelete ? <DropdownMenuSeparator /> : null}
          {canUpdateStatus && person.enabled ? (
            <DropdownMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={onUpdateStatus}>
              Desactivar acceso
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
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

export type PersonActionsMenuProps = {
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
