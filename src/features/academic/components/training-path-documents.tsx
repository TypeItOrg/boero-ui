"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { Checkbox } from "@common/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@common/components/ui/alert-dialog";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import { DOCUMENT_LEVEL_LABELS, DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import { saveDocumentRequirement } from "@features/enrollment-applications/actions/documentation.actions";

export function TrainingPathDocuments({
  scope,
  institutionId,
  pathId,
  requirements,
  canEdit,
}: {
  scope: AcademicScope;
  institutionId: string;
  pathId: string;
  requirements: DocumentRequirement[];
  canEdit: boolean;
}): React.ReactElement {
  const [editing, setEditing] = React.useState<DocumentRequirement | null | undefined>(undefined);
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Documentación</h2>
        {canEdit ? <Button onClick={() => setEditing(null)}>Nuevo requisito</Button> : null}
      </header>
      {!requirements.length ? <p className="text-muted-foreground">Todavía no se configuraron requisitos documentales.</p> : null}
      {requirements.map((item) => (
        <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div>
            <h3 className="font-medium">
              {item.name}
              {!item.active ? " · Inactivo" : ""}
            </h3>
            <p className="text-muted-foreground text-sm">
              {DOCUMENT_LEVEL_LABELS[item.level]} · Orden {item.displayOrder}
            </p>
            <p className="text-sm whitespace-pre-wrap">{item.instructions}</p>
          </div>
          {canEdit ? (
            <Button variant="outline" onClick={() => setEditing(item)}>
              Editar
            </Button>
          ) : null}
        </article>
      ))}
      {editing !== undefined ? (
        <RequirementForm scope={scope} institutionId={institutionId} pathId={pathId} initial={editing} onClose={() => setEditing(undefined)} />
      ) : null}
    </section>
  );
}
function RequirementForm({
  scope,
  institutionId,
  pathId,
  initial,
  onClose,
}: {
  scope: AcademicScope;
  institutionId: string;
  pathId: string;
  initial: DocumentRequirement | null;
  onClose: () => void;
}): React.ReactElement {
  const router = useRouter();
  const [state, action, pending] = React.useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    try {
      const result = await saveDocumentRequirement(scope, institutionId, pathId, initial?.id ?? null, previous, form);
      if (result.success) {
        router.refresh();
        onClose();
      }
      return result;
    } catch {
      return { error: DOCUMENT_MESSAGES.failed };
    }
  }, {});
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
        <form action={action} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{initial ? "Editar requisito" : "Nuevo requisito documental"}</AlertDialogTitle>
            <AlertDialogDescription>Los cambios se aplican a solicitudes nuevas.</AlertDialogDescription>
          </AlertDialogHeader>
          <label className="block space-y-2">
            <span>Nombre</span>
            <Input name="name" defaultValue={initial?.name ?? ""} maxLength={150} required />
          </label>
          <label className="block space-y-2">
            <span>Instrucciones</span>
            <Textarea name="instructions" defaultValue={initial?.instructions ?? ""} maxLength={1000} />
          </label>
          <div className="space-y-2">
            <span>Exigencia</span>
            <Select name="level" defaultValue={initial?.level ?? "AT_SUBMISSION"}>
              <SelectTrigger aria-label="Exigencia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <fieldset className="flex flex-wrap gap-4">
            <legend className="mb-2">Formatos admitidos</legend>
            {[
              ["application/pdf", "PDF"],
              ["image/jpeg", "JPEG"],
              ["image/png", "PNG"],
            ].map(([value, label]) => (
              <label className="flex items-center gap-2" key={value}>
                <Checkbox name="allowedFormats" value={value} defaultChecked={initial?.allowedFormats.includes(value) ?? true} />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="block space-y-2">
            <span>Orden</span>
            <Input name="displayOrder" type="number" min={0} step={1} defaultValue={initial?.displayOrder ?? 0} required />
          </label>
          <div className="space-y-2">
            <span>Estado</span>
            <Select name="active" defaultValue={initial?.active === false ? "false" : "true"}>
              <SelectTrigger aria-label="Estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state.error ? (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar requisito"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
