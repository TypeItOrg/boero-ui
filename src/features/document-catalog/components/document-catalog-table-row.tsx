"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { EllipsisVerticalIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import type { PlatformDocumentDefinition } from "@features/document-catalog/types/platform-document-definition.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogTableRow({
  item,
  documentHref,
  canManage,
  editHref,
  scope,
}: {
  item: PlatformDocumentDefinition | DocumentDefinition;
  documentHref: (item: DocumentDefinition | PlatformDocumentDefinition) => string;
  canManage: boolean;
  editHref: (item: DocumentDefinition | PlatformDocumentDefinition) => string;
  scope: AcademicScope;
}): ReactElement {
  return (
    <ContextMenu key={item.id}>
      <ContextMenuTrigger asChild>
        <TableRow>
          <TableCell className="w-16 pl-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" size="icon-lg" variant="ghost" aria-label={`Abrir acciones de ${item.name}`}>
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 p-1.5">
                <DropdownMenuItem asChild>
                  <Link href={documentHref(item)} className="px-2.5 py-1.5">
                    Ver detalle
                  </Link>
                </DropdownMenuItem>
                {canManage ? (
                  <DropdownMenuItem asChild>
                    <Link href={editHref(item)} className="px-2.5 py-1.5">
                      Editar
                    </Link>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
          <TableCell className="font-medium">
            <Link href={documentHref(item)} className="hover:underline">
              {item.name}
            </Link>
          </TableCell>
          {scope === "admin" && "institutionName" in item ? <TableCell>{item.institutionName}</TableCell> : null}
          <TableCell className="text-muted-foreground">{formatDocumentFileCategories(item.allowedFormats)}</TableCell>
          <TableCell>
            <Badge variant={item.active ? "success" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1.5">
        <ContextMenuItem asChild>
          <Link href={documentHref(item)} className="px-2.5 py-1.5">
            Ver detalle
          </Link>
        </ContextMenuItem>
        {canManage ? (
          <ContextMenuItem asChild>
            <Link href={editHref(item)} className="px-2.5 py-1.5">
              Editar
            </Link>
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
