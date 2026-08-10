"use client";

import { BlockingError } from "@common/components/blocking-error";
import "@app/globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalError({ error, retry }: GlobalErrorProps): React.ReactElement {
  return (
    <html lang="es">
      <body>
        <BlockingError error={error} retry={retry} className="bg-muted min-h-dvh" />
      </body>
    </html>
  );
}
