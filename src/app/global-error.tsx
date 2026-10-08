"use client";

import type { ReactElement } from "react";

import "@app/globals.css";

import { BlockingError } from "@common/components/blocking-error";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps): ReactElement {
  return (
    <html lang="es">
      <body>
        <BlockingError error={error} retry={retry} className="bg-muted min-h-dvh" />
      </body>
    </html>
  );
}
