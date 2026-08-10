"use client";

import { catchError, type ErrorInfo } from "next/error";
import * as React from "react";

import { BlockingError } from "@common/components/blocking-error";
import { PLATFORM_DASHBOARD_ERROR_MESSAGES } from "@features/platform-dashboard/constants/error-messages.constants";

function PlatformDashboardErrorFallback(
  _props: Record<string, unknown>,
  { error, retry }: ErrorInfo,
): React.ReactElement {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BlockingError
      retry={retry}
      title={PLATFORM_DASHBOARD_ERROR_MESSAGES.DASHBOARD_TITLE}
      description={PLATFORM_DASHBOARD_ERROR_MESSAGES.DASHBOARD_DESCRIPTION}
      homeHref="/admin"
    />
  );
}

export const PlatformDashboardErrorBoundary = catchError(PlatformDashboardErrorFallback);
