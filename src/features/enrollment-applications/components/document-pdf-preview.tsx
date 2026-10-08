"use client";

import * as React from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

import { Button } from "@common/components/ui/button";
import { Skeleton } from "@common/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@common/components/ui/tabs";
import { cn } from "@common/utils/cn.util";

export function DocumentPdfPreview({
  src,
  name,
  expanded,
  onError,
}: {
  src: string;
  name: string;
  expanded: boolean;
  onError: () => void;
}): React.ReactElement {
  const previewId = React.useId();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = React.useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [fitWidth, setFitWidth] = React.useState(true);
  const [zoom, setZoom] = React.useState<number | null>(null);
  const [renderedScale, setRenderedScale] = React.useState(1);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  const renderTaskRef = React.useRef<RenderTask | null>(null);
  const automaticFit = zoom === null;
  const controlsDisabled = loading || !pdf;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      setSize((previous) => (previous.width === width && previous.height === height ? previous : { width, height }));
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let active = true;
    let task: PDFDocumentLoadingTask | undefined;

    async function load(): Promise<void> {
      try {
        const library = await import("pdfjs-dist");
        if (!active) {
          return;
        }
        library.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        task = library.getDocument({ url: src, withCredentials: true, useSystemFonts: true });
        const document = await task.promise;
        if (active) {
          setPdf(document);
        }
      } catch {
        if (active) {
          onError();
        }
      }
    }

    void load();
    return () => {
      active = false;
      void task?.destroy().catch(() => undefined);
    };
  }, [src, onError]);

  React.useEffect(() => {
    if (!pdf || size.width === 0 || size.height === 0) {
      return;
    }

    let active = true;
    let renderTask: RenderTask | undefined;
    const previousRender = renderTaskRef.current?.promise.catch(() => undefined);

    async function render(): Promise<void> {
      try {
        // PDF.js must finish cancelling the previous render before reusing its canvas.
        await previousRender;
        if (!active) {
          return;
        }

        const page = await pdf!.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!active || !canvas) {
          return;
        }

        setLoading(true);
        const base = page.getViewport({ scale: 1 });
        const widthScale = size.width / base.width;
        const pageScale = Math.min(widthScale, size.height / base.height);
        const scale = expanded ? (zoom ?? (fitWidth ? widthScale : pageScale)) : pageScale;
        const viewport = page.getViewport({ scale: scale * Math.min(window.devicePixelRatio || 1, 2) });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${Math.floor(base.width * scale)}px`;
        canvas.style.height = `${base.height * scale}px`;
        renderTask = page.render({ canvas, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (active) {
          setRenderedScale(scale);
          setLoading(false);
        }
      } catch {
        if (active) {
          onError();
        }
      }
    }

    void render();
    return () => {
      active = false;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, expanded, fitWidth, zoom, size, onError]);

  function changePage(next: number): void {
    setLoading(true);
    setPageNumber(next);
    containerRef.current?.scrollTo({ top: 0, left: 0 });
  }

  function changeFit(width: boolean): void {
    if (zoom === null && fitWidth === width) {
      return;
    }

    setLoading(true);
    setZoom(null);
    setFitWidth(width);
    containerRef.current?.scrollTo({ top: 0, left: 0 });
  }

  function changeZoom(delta: number): void {
    setLoading(true);
    setZoom(Math.min(3, Math.max(0.25, Math.round((renderedScale + delta) * 100) / 100)));
  }

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
