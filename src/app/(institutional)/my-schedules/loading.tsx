import { CalendarRangeIcon } from "lucide-react";

import { Skeleton } from "@common/components/ui/skeleton";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";

export default function Loading(): React.ReactElement {
  return (
    <PlatformPageShell
      minViewportHeight
      title="Mis horarios"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <div className="flex flex-1 flex-col" aria-busy="true">
        <Skeleton className="min-h-56 w-full flex-1 rounded-xl" aria-hidden="true" />
      </div>
    </PlatformPageShell>
  );
}
