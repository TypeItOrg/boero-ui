"use client";

import type { Dispatch, ReactElement, RefObject, SetStateAction } from "react";

import { FileTextIcon, RotateCcwIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";

import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function TrainingPathDocumentRequirementCard({
  item,
  canEdit,
  pending,
  openerRef,
  setCreating,
  setEditing,
  setDrafts,
  savedRequirementIds,
}: {
  item: TrainingPathDocumentDraft;
  canEdit: boolean;
  pending: boolean;
  openerRef: RefObject<HTMLButtonElement | null>;
  setCreating: Dispatch<SetStateAction<boolean>>;
  setEditing: Dispatch<SetStateAction<TrainingPathDocumentDraft | null | undefined>>;
  setDrafts: Dispatch<SetStateAction<TrainingPathDocumentDraft[]>>;
  savedRequirementIds: Record<string, string>;
}): ReactElement {
  return (
    <Card role="article" aria-labelledby={`document-requirement-${item.clientId}`}>
      <CardHeader className="flex flex-row items-stretch gap-3">
        <div className="bg-primary/10 text-primary flex w-11 shrink-0 items-center justify-center rounded-lg">
          <FileTextIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <CardTitle className="flex min-w-0 items-center gap-1">
              <h3 id={`document-requirement-${item.clientId}`} className="min-w-0 break-words">
                {item.name}
              </h3>
              <div className="hidden shrink-0 @3xl/document-requirement:flex">
                <TrainingPathDocumentInstructions
                  name={item.name}
                  instructions={item.instructions}
                  specificInstructions={item.specificInstructions}
                  className="size-6"
                />
              </div>
            </CardTitle>
            {!item.active ? <Badge variant="secondary">Asignación inactiva</Badge> : null}
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{formatDocumentFileCategories(item.allowedFormats)}</span>
            <Badge variant="outline" className="h-auto max-w-full whitespace-normal">
              {DOCUMENT_LEVEL_LABELS[item.level]}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      {item.documentActive === false || item.instructions?.trim() || item.specificInstructions?.trim() ? (
        <CardContent className={item.documentActive === false ? "space-y-3" : "space-y-3 @3xl/document-requirement:hidden"}>
          <dl className="space-y-3 empty:hidden @3xl/document-requirement:hidden">
            {item.instructions?.trim() ? (
              <div className="min-w-0 space-y-1">
                <dt className="text-muted-foreground">{item.specificInstructions?.trim() ? "Instrucciones generales" : "Instrucciones"}</dt>
                <dd className="leading-relaxed break-words whitespace-pre-wrap">{item.instructions}</dd>
              </div>
            ) : null}
            {item.specificInstructions?.trim() ? (
              <div className="min-w-0 space-y-1">
                <dt className="text-muted-foreground">Instrucciones del trayecto</dt>
                <dd className="leading-relaxed break-words whitespace-pre-wrap">{item.specificInstructions}</dd>
              </div>
            ) : null}
          </dl>
          {item.documentActive === false ? (
            <p className="text-muted-foreground text-sm">Documento inactivo en el catálogo: no se exige en los borradores.</p>
          ) : null}
        </CardContent>
      ) : null}
      {canEdit ? (
        <CardFooter className="justify-end py-3">
          <div className="grid w-full grid-cols-2 gap-2 @3xl/document-requirement:flex @3xl/document-requirement:w-auto">
            <Button
              size="lg"
              className="min-w-0"
              type="button"
              variant="secondary"
              aria-label={`Configurar requisito de ${item.name}`}
              disabled={pending}
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setCreating(false);
                setEditing(item);
              }}
            >
              <SlidersHorizontalIcon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
              Configurar
            </Button>
            <Button
              size="lg"
              className="border-border bg-background min-w-0 @3xl/document-requirement:border-transparent @3xl/document-requirement:bg-transparent"
              type="button"
              variant="ghost"
              aria-label={item.active ? `Quitar ${item.name} del trayecto` : `Reactivar requisito de ${item.name}`}
              disabled={pending}
              onClick={() =>
                setDrafts((previous) =>
                  item.id || savedRequirementIds[item.clientId]
                    ? previous.map((value) => (value.clientId === item.clientId ? { ...value, active: !value.active, dirty: true } : value))
                    : previous.filter((value) => value.clientId !== item.clientId),
                )
              }
            >
              {item.active ? (
                <Trash2Icon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
              ) : (
                <RotateCcwIcon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
              )}
              {item.active ? "Quitar" : "Reactivar"}
            </Button>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
