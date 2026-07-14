"use client";

import { BlockingError } from "@common/components/blocking-error";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps): React.ReactElement {
  return (
    <html lang="es">
      <body>
        <BlockingError error={error} reset={reset} className="bg-muted min-h-dvh" />
      </body>
    </html>
  );
}
