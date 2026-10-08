"use client";

import type { ReactElement, ReactNode } from "react";

import { FileTextIcon } from "lucide-react";

import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function DocumentCatalogShell({ breadcrumb, children }: { breadcrumb: ReactNode; children: ReactNode }): ReactElement {
  return (
    <PlatformPageShell title="Documentación" breadcrumb={breadcrumb} actions={<PlatformPageIcon icon={FileTextIcon} />}>
      {children}
    </PlatformPageShell>
  );
}
