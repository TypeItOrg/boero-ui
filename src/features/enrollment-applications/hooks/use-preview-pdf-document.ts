"use client";

import { useEffect, useState } from "react";

import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

import type { DocumentPdfPreviewProps } from "@features/enrollment-applications/types/document-pdf-preview-props.types";

export function usePreviewPdfDocument(src: string, onError: DocumentPdfPreviewProps["onError"]) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);

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

  return pdf;
}
