"use client";

import type { ReactElement } from "react";

import { BlockingError } from "@common/components/blocking-error";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function PlatformError({ error, retry }: PlatformErrorProps): ReactElement {
  return <BlockingError error={error} retry={retry} homeHref="/admin" />;
}
