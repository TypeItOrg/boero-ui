"use client";

import { useId, useState } from "react";

import { usePreviewContainerSize } from "@features/enrollment-applications/hooks/use-preview-container-size";
import { usePreviewPdfCanvas } from "@features/enrollment-applications/hooks/use-preview-pdf-canvas";
import { usePreviewPdfDocument } from "@features/enrollment-applications/hooks/use-preview-pdf-document";
import type { DocumentPdfPreviewProps } from "@features/enrollment-applications/types/document-pdf-preview-props.types";

export function useDocumentPdfPreview({ src, expanded, onError }: DocumentPdfPreviewProps) {
  const previewId = useId();
  const { containerRef, size } = usePreviewContainerSize();
  const pdf = usePreviewPdfDocument(src, onError);
  const [view, setView] = useState({ pageNumber: 1, fitWidth: true, zoom: null as number | null });
  const { pageNumber, fitWidth, zoom } = view;
  const { canvasRef, loading, renderedScale } = usePreviewPdfCanvas({ pdf, pageNumber, expanded, fitWidth, zoom, size, onError });
  const automaticFit = zoom === null;
  const controlsDisabled = loading || !pdf;

  function changePage(next: number): void {
    if (!pdf || next < 1 || next > pdf.numPages || next === pageNumber) {
      return;
    }

    setView((previous) => ({ ...previous, pageNumber: next }));
    containerRef.current?.scrollTo({ top: 0, left: 0 });
  }

  function changeFit(width: boolean): void {
    if (zoom === null && fitWidth === width) {
      return;
    }

    setView((previous) => ({ ...previous, zoom: null, fitWidth: width }));
    containerRef.current?.scrollTo({ top: 0, left: 0 });
  }

  function changeZoom(delta: number): void {
    setView((previous) => ({ ...previous, zoom: Math.min(3, Math.max(0.25, Math.round((renderedScale + delta) * 100) / 100)) }));
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
