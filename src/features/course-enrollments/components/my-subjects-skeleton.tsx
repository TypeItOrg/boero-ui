import type { ReactElement } from "react";

import { Skeleton } from "@common/components/ui/skeleton";

export function MySubjectsSkeleton(): ReactElement {
  return <Skeleton className="min-h-56 w-full flex-1 rounded-xl" aria-hidden="true" />;
}
