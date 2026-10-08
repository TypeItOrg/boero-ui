"use client";

import { useEffect, useRef, useState } from "react";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export function usePreviewPdfCanvas({
  pdf,
  pageNumber,
  expanded,
  fitWidth,
  zoom,
  size,
  onError,
}: {
  pdf: PDFDocumentProxy | null;
  pageNumber: number;
  expanded: boolean;
  fitWidth: boolean;
  zoom: number | null;
  size: { width: number; height: number };
  onError: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [rendered, setRendered] = useState<{ document: PDFDocumentProxy; signature: string; scale: number }>();
  const signature = JSON.stringify([pageNumber, expanded, fitWidth, zoom, size]);
  const loading = !pdf || !rendered || rendered.document !== pdf || rendered.signature !== signature;

  useEffect(() => {
    if (!pdf || size.width === 0 || size.height === 0) {
      return;
    }

    const document = pdf;
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

        const page = await document.getPage(pageNumber);
        const canvas = canvasRef.current;

        if (!active || !canvas) {
          return;
        }

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
          setRendered({ document, signature, scale });
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
  }, [pdf, pageNumber, expanded, fitWidth, zoom, size, signature, onError]);

  return { canvasRef, loading, renderedScale: rendered?.scale ?? 1 };
}
