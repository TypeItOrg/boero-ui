"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

import type { DocumentPdfPreviewProps } from "@features/enrollment-applications/types/document-pdf-preview-props.types";

export function useDocumentPdfPreview({ src, expanded, onError }: DocumentPdfPreviewProps) {
  const previewId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fitWidth, setFitWidth] = useState(true);
  const [zoom, setZoom] = useState<number | null>(null);
  const [renderedScale, setRenderedScale] = useState(1);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const renderTaskRef = useRef<RenderTask | null>(null);
  const automaticFit = zoom === null;
  const controlsDisabled = loading || !pdf;

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
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
        const viewport = page.getViewport({
          scale: scale * Math.min(window.devicePixelRatio || 1, 2),
        });
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

  return {
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
  };
}
