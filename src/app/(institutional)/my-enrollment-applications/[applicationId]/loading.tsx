import type { ReactElement } from "react";

import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";

export default function MyEnrollmentApplicationDetailLoading(): ReactElement {
  return <PlatformRouteSkeleton />;
}
