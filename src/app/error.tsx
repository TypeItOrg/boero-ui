"use client";

import type { ReactElement } from "react";

import { BlockingError } from "@common/components/blocking-error";

type AppErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function AppError({ error, retry }: AppErrorProps): ReactElement {
  return <BlockingError error={error} retry={retry} className="bg-muted min-h-dvh" />;
}
