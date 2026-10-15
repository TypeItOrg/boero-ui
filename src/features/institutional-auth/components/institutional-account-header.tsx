"use client";

import type { ReactElement, ReactNode } from "react";

import { usePathname } from "next/navigation";

import { InstitutionalAccountTabs } from "@features/institutional-auth/components/institutional-account-tabs";

type InstitutionalAccountHeaderProps = {
  actions?: ReactNode;
};

const ACCOUNT_PAGE_TITLES: Readonly<Record<string, string>> = {
  "/account": "Cuenta",
  "/account/edit": "Editar perfil",
  "/account/password": "Contraseña",
  "/account/passkeys": "Llaves de acceso",
  "/account/sessions": "Sesiones",
};

export function InstitutionalAccountTitle(): ReactElement {
  const pathname = usePathname();

  return <>{ACCOUNT_PAGE_TITLES[pathname] ?? "Cuenta"}</>;
}

export function InstitutionalAccountHeader({ actions }: InstitutionalAccountHeaderProps): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <InstitutionalAccountTabs />
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
