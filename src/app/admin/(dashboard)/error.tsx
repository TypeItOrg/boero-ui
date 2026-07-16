"use client";

import { BlockingError } from "@common/components/blocking-error";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlatformError({ error, reset }: PlatformErrorProps): React.ReactElement {
  return <BlockingError error={error} reset={reset} />;
}
