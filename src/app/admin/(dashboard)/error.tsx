"use client";

import { BlockingError } from "@common/components/blocking-error";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function PlatformError({ error, retry }: PlatformErrorProps): React.ReactElement {
  return <BlockingError error={error} retry={retry} homeHref="/admin" />;
}
