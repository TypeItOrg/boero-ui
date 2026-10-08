"use client";

import type { ReactElement } from "react";

import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Skeleton } from "@common/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@common/components/ui/tabs";
import { cn } from "@common/utils/cn.util";

import { useDocumentPdfPreview } from "@features/enrollment-applications/hooks/use-document-pdf-preview";
import type { DocumentPdfPreviewProps } from "@features/enrollment-applications/types/document-pdf-preview-props.types";

export function DocumentPdfPreview(props: DocumentPdfPreviewProps): ReactElement {
  return <DocumentPdfPreviewView key={props.src} {...props} />;
}

function DocumentPdfPreviewView({ src, name, expanded, onError }: DocumentPdfPreviewProps): ReactElement {
  const {
    previewId,
    containerRef,
    canvasRef,
    pdf,
    pageNumber,
    loading,
    fitWidth,
    renderedScale,
    automaticFit,
    controlsDisabled,
    changeFit,
    changeZoom,
    changePage,
  } = useDocumentPdfPreview({ src, name, expanded, onError });

  return (
    <div className={cn("flex h-full min-h-0 flex-col", expanded && "gap-3")}>
      {expanded ? (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2" aria-label="Controles de vista del PDF">
          <Tabs value={automaticFit ? (fitWidth ? "width" : "page") : ""} onValueChange={(value) => changeFit(value === "width")}>
            <TabsList className="flex h-[52px]! gap-1 p-1" aria-label="Ajuste de la vista del PDF">
              <TabsTrigger
                value="width"
                id={`${previewId}-width`}
                aria-controls={previewId}
                disabled={controlsDisabled}
                className="h-10! px-4 py-2 text-center text-sm"
              >
                Ajustar al ancho
              </TabsTrigger>
              <TabsTrigger
                value="page"
                id={`${previewId}-page`}
                aria-controls={previewId}
                disabled={controlsDisabled}
                className="h-10! px-4 py-2 text-center text-sm"
              >
                Página completa
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="size-11"
              aria-label="Alejar documento"
              title="Alejar"
              disabled={controlsDisabled || renderedScale <= 0.25}
              onClick={() => changeZoom(-0.25)}
            >
              <MinusIcon aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              className="size-11"
              aria-label="Acercar documento"
              title="Acercar"
              disabled={controlsDisabled || renderedScale >= 3}
              onClick={() => changeZoom(0.25)}
            >
              <PlusIcon aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
      <div
        ref={containerRef}
        id={previewId}
        className={cn(
          "relative min-h-0 flex-1",
          expanded ? "[scrollbar-gutter:stable] overflow-y-auto" : "flex items-center justify-center overflow-hidden",
          expanded && (automaticFit ? "overflow-x-hidden" : "overflow-x-auto"),
        )}
        aria-busy={loading}
        tabIndex={expanded ? 0 : undefined}
        role={expanded ? (automaticFit ? "tabpanel" : "region") : undefined}
        aria-labelledby={expanded && automaticFit ? `${previewId}-${fitWidth ? "width" : "page"}` : undefined}
        aria-label={expanded && !automaticFit ? `Documento ${name}` : undefined}
      >
        {loading ? (
          <div role="status" className="absolute inset-0">
            <span className="sr-only">Cargando vista previa…</span>
            <Skeleton className="h-full w-full" />
          </div>
        ) : null}
        <div
          className={cn(
            "flex justify-center",
            expanded ? "min-h-full items-start" : "h-full w-full items-center",
            expanded && (automaticFit ? "w-full min-w-0" : "w-max min-w-full"),
          )}
        >
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Vista previa de ${name}, página ${pageNumber}`}
            className={cn(
              expanded ? "shrink-0 bg-white shadow-sm" : "max-h-full max-w-full object-contain",
              expanded && automaticFit && "max-w-full",
            )}
          />
        </div>
      </div>
      {expanded && pdf && pdf.numPages > 1 ? (
        <div className="flex shrink-0 items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={loading || pageNumber === 1}
            onClick={() => changePage(pageNumber - 1)}
          >
            Anterior
          </Button>
          <span className="text-muted-foreground text-xs">
            Página {pageNumber} de {pdf.numPages}
          </span>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={loading || pageNumber === pdf.numPages}
            onClick={() => changePage(pageNumber + 1)}
          >
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
