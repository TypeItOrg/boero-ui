"use client";

import { useRouter } from "next/navigation";

import { BlockingError } from "@common/components/blocking-error";
import { ErrorBoundary } from "@common/components/error-boundary";
import { PLATFORM_DASHBOARD_ERROR_MESSAGES } from "@features/platform-dashboard/constants/error-messages.constants";

type PlatformDashboardErrorBoundaryProps = {
  children: React.ReactNode;
};

export function PlatformDashboardErrorBoundary({ children }: PlatformDashboardErrorBoundaryProps): React.ReactElement {
  return <ErrorBoundary fallback={(reset) => <PlatformDashboardError reset={reset} />}>{children}</ErrorBoundary>;
}

type PlatformDashboardErrorProps = {
  reset: () => void;
};

export function PlatformDashboardError({ reset }: PlatformDashboardErrorProps): React.ReactElement {
  const router = useRouter();

  return (
    <BlockingError
      reset={() => {
        reset();
        router.refresh();
      }}
      title={PLATFORM_DASHBOARD_ERROR_MESSAGES.DASHBOARD_TITLE}
      description={PLATFORM_DASHBOARD_ERROR_MESSAGES.DASHBOARD_DESCRIPTION}
    />
  );
}
