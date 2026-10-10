import type { ReactElement } from "react";

import { FileTextIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function TrainingPathDocuments({ requirements }: { requirements: DocumentRequirement[] }): ReactElement {
  return (
    <section aria-labelledby="training-path-documents-title" className="bg-muted/25 flex min-w-0 flex-col gap-5 rounded-xl border p-5 md:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={FileTextIcon}
          title="Documentación requerida para la inscripción"
          compactTitle="Documentación requerida"
          description="Requisitos de este trayecto para nuevas solicitudes"
          titleId="training-path-documents-title"
        />
      </header>
      {requirements.length === 0 ? (
        <Empty className="bg-muted/25 min-h-80 rounded-lg border border-solid px-4 py-12">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <FileTextIcon className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">Sin documentación requerida</EmptyTitle>
            <EmptyDescription>Este trayecto no tiene requisitos documentales configurados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="min-w-0 overflow-hidden rounded-lg border">
          <Table className="min-w-max table-auto" aria-label="Documentación requerida para la inscripción">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead scope="col" className="min-w-64">
                  Documento
                </TableHead>
                <TableHead scope="col" className="w-64 min-w-64">
                  Exigencia
                </TableHead>
                <TableHead scope="col" className="w-44 min-w-44">
                  Formatos permitidos
                </TableHead>
                <TableHead scope="col" className="w-28 min-w-28">
                  Asignación
                </TableHead>
                <TableHead scope="col" className="w-16 min-w-16 text-right">
                  Orden
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requirements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-3">
                    <RequirementName item={item} />
                  </TableCell>
                  <TableCell className="py-3">{DOCUMENT_LEVEL_LABELS[item.level]}</TableCell>
                  <TableCell className="py-3">{formatDocumentFileCategories(item.allowedFormats)}</TableCell>
                  <TableCell className="py-3">
                    <RequirementStatus item={item} />
                  </TableCell>
                  <TableCell className="py-3 text-right tabular-nums">{item.displayOrder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

function RequirementName({ item }: { item: DocumentRequirement }): ReactElement {
  return (
    <div className="space-y-1">
      <div className="flex min-w-0 items-center gap-1">
        <h3 className="text-sm font-medium whitespace-nowrap">{item.name}</h3>
        <TrainingPathDocumentInstructions name={item.name} instructions={item.instructions} specificInstructions={item.specificInstructions} />
      </div>
      {item.documentActive === false ? <p className="text-muted-foreground text-sm">Documento inactivo en el catálogo</p> : null}
    </div>
  );
}

function RequirementStatus({ item }: { item: DocumentRequirement }): ReactElement {
  return <Badge variant={item.active === false ? "secondary" : "success"}>{item.active === false ? "Inactiva" : "Activa"}</Badge>;
}
