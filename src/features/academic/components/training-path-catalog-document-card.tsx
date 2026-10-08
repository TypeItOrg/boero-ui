"use client";

import type { ReactElement } from "react";

import Link from "next/link";
import type { ReadonlyURLSearchParams } from "next/navigation";

import { ExternalLinkIcon, FileTextIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { appendReturnTo } from "@common/utils/return-to.util";

import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogEditPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function TrainingPathCatalogDocumentCard({
  document,
  canManageCatalog,
  scope,
  institutionId,
  pathname,
  searchParams,
}: {
  document: DocumentDefinition;
  canManageCatalog: boolean;
  scope: AcademicScope;
  institutionId: string;
  pathname: string;
  searchParams: ReadonlyURLSearchParams;
}): ReactElement {
  return (
    <Card className="bg-muted/20 gap-3 border ring-0" role="group" aria-label="Documento del catálogo">
      <CardHeader className="flex flex-row items-stretch gap-3">
        <div className="bg-primary/10 text-primary flex w-11 shrink-0 items-center justify-center rounded-lg">
          <FileTextIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle className="flex min-w-0 items-center gap-1">
            <h3 className="min-w-0 break-words">{document.name}</h3>
            <TrainingPathDocumentInstructions name={document.name} instructions={document.instructions} className="size-6" />
          </CardTitle>
          <CardDescription>{formatDocumentFileCategories(document.allowedFormats)}</CardDescription>
        </div>
      </CardHeader>
      {canManageCatalog ? (
        <CardFooter className="py-3">
          <Button size="lg" asChild type="button" variant="outline" className="w-full justify-start gap-2">
            <Link
              target="_blank"
              rel="noreferrer"
              aria-label={`Editar definición compartida de ${document.name} en el catálogo (se abre en una nueva pestaña)`}
              href={appendReturnTo(
                getDocumentCatalogEditPageUrl(scope, institutionId, document.id),
                pathname + (searchParams.toString() ? "?" + searchParams.toString() : ""),
              )}
            >
              <span>Editar en el catálogo</span>
              <ExternalLinkIcon data-icon="inline-end" className="text-muted-foreground ml-auto size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
