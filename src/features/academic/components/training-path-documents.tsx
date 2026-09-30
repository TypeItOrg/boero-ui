import { FileTextIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";
import { SectionHeader } from "@common/components/section-header";

export function TrainingPathDocuments({ requirements, editHref }: { requirements: DocumentRequirement[]; editHref?: string }): React.ReactElement {
  return (
    <section aria-labelledby="training-path-documents-title" className="bg-muted/25 space-y-5 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={FileTextIcon}
          title="Documentación requerida para la inscripción"
          compactTitle="Documentación requerida"
          description="Documentos solicitados a quienes se inscriben en este trayecto. Los cambios se aplican a solicitudes nuevas."
          compactDescription="Requisitos de este trayecto para nuevas solicitudes."
          titleId="training-path-documents-title"
        />
      </header>
      {editHref ? (
        <Button asChild variant="outline">
          <ReturnToLink href={editHref}>Editar requisitos de inscripción</ReturnToLink>
        </Button>
      ) : null}
      {requirements.length === 0 ? (
        <Empty className="rounded-lg px-4 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-base">Sin documentación requerida</EmptyTitle>
            <EmptyDescription>Este trayecto no tiene requisitos documentales configurados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {requirements.map((item) => (
        <article key={item.id} className="space-y-2 rounded-lg border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="min-w-0 font-medium break-words">{item.name}</h3>
            <Badge variant={item.active === false ? "outline" : "success"}>{item.active === false ? "Inactivo" : "Activo"}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {DOCUMENT_LEVEL_LABELS[item.level]} · Orden {item.displayOrder} · {formatDocumentFileCategories(item.allowedFormats)}
          </p>
          {item.instructions ? <p className="text-sm break-words whitespace-pre-wrap">{item.instructions}</p> : null}
        </article>
      ))}
    </section>
  );
}
