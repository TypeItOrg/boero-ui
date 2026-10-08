import { GraduationCapIcon } from "lucide-react";

import { MySubjectsSkeleton } from "@features/course-enrollments/components/my-subjects-skeleton";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export default function Loading(): React.ReactElement {
  return (
    <PlatformPageShell
      minViewportHeight
      title="Mis materias"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={<PlatformPageIcon icon={GraduationCapIcon} />}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5" aria-busy="true">
        <MySubjectsSkeleton />
      </div>
    </PlatformPageShell>
  );
}
