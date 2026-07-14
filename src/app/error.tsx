"use client";

import { BlockingError } from "@common/components/blocking-error";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps): React.ReactElement {
  return <BlockingError error={error} reset={reset} className="bg-muted min-h-dvh" />;
}
