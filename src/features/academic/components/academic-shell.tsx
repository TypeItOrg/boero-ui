import type { ReactElement, ReactNode } from "react";

import Link from "next/link";

import { ArrowLeftIcon, type LucideIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type AcademicShellProps = {
  actions?: ReactNode;
  backHref?: string;
  breadcrumb: ReactNode;
  children: ReactNode;
  actionsClassName?: string;
  headerClassName?: string;
  minViewportHeight?: boolean;
  title: string;
};

export function AcademicShell({
  title,
  breadcrumb,
  backHref,
  children,
  actions,
  actionsClassName,
  headerClassName,
  minViewportHeight,
}: AcademicShellProps): ReactElement {
  const headerActions = actions ?? getBackAction(backHref);

  return (
    <PlatformPageShell
      title={title}
      breadcrumb={breadcrumb}
      actions={headerActions}
      actionsClassName={actionsClassName}
      headerClassName={headerClassName}
      minViewportHeight={minViewportHeight}
    >
      {children}
    </PlatformPageShell>
  );
}

export function AcademicPageIcon({ icon: Icon }: { icon: LucideIcon }): ReactElement {
  return <PlatformPageIcon icon={Icon} />;
}

function getBackAction(backHref: string | undefined): ReactNode {
  if (!backHref) {
    return undefined;
  }

  return (
    <Button asChild variant="outline" size="lg">
      <Link href={backHref}>
        <ArrowLeftIcon />
        Volver
      </Link>
    </Button>
  );
}

export function AcademicAccessDenied({ breadcrumb }: { breadcrumb: ReactNode }): ReactElement {
  return (
    <AcademicShell title="Acceso restringido" breadcrumb={breadcrumb}>
      <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">Solicitá un rol con permisos de gestión académica.</div>
    </AcademicShell>
  );
}
