import Link from "next/link";
import { ArrowLeftIcon, type LucideIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type AcademicShellProps = {
  actions?: React.ReactNode;
  backHref?: string;
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  actionsClassName?: string;
  headerClassName?: string;
  minViewportHeight?: boolean;
  title: string;
};

export function AcademicShell({
  title,
  description,
  breadcrumb,
  backHref,
  children,
  actions,
  actionsClassName,
  headerClassName,
  minViewportHeight,
}: AcademicShellProps): React.ReactElement {
  const headerActions = actions ?? getBackAction(backHref);
  return (
    <PlatformPageShell
      title={title}
      description={description}
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

export function AcademicPageIcon({ icon: Icon }: { icon: LucideIcon }): React.ReactElement {
  return (
    <div className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
      <Icon className="size-6 sm:size-7" aria-hidden="true" />
    </div>
  );
}

function getBackAction(backHref: string | undefined): React.ReactNode {
  if (!backHref) return undefined;
  return (
    <Button asChild variant="outline" size="lg">
      <Link href={backHref}>
        <ArrowLeftIcon />
        Volver
      </Link>
    </Button>
  );
}

export function AcademicAccessDenied({ breadcrumb }: { breadcrumb: React.ReactNode }): React.ReactElement {
  return (
    <AcademicShell title="Acceso restringido" description="No tenés permisos para modificar esta configuración." breadcrumb={breadcrumb}>
      <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center">Solicitá un rol con permisos de gestión académica.</div>
    </AcademicShell>
  );
}
