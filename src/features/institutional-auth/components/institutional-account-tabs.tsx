"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@common/utils/cn.util";

const ACCOUNT_TABS = [
  { title: "Perfil", url: "/account" },
  { title: "Contraseña", url: "/account/password" },
  { title: "Claves de acceso", url: "/account/passkeys" },
  { title: "Sesiones", url: "/account/sessions" },
] as const;

export function InstitutionalAccountTabs(): React.ReactElement {
  const pathname = usePathname();
  const activeUrl = getActiveTabUrl(pathname);

  return (
    <nav aria-label="Secciones de la cuenta" className="w-full max-w-full sm:w-fit">
      <div className="bg-muted text-muted-foreground grid grid-cols-2 items-center gap-1 rounded-lg p-1 text-sm font-medium sm:flex sm:gap-0.5 sm:p-[3px]">
        {ACCOUNT_TABS.map((tab) => {
          const isActive = tab.url === activeUrl;

          return (
            <Link
              key={tab.url}
              href={tab.url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center justify-center rounded-md px-1 py-1 text-center transition-colors sm:h-[30px] sm:min-h-0 sm:px-2.5 sm:py-0 sm:whitespace-nowrap",
                isActive ? "bg-background text-foreground shadow-xs" : "hover:text-foreground",
              )}
            >
              {tab.title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function getActiveTabUrl(pathname: string): string {
  if (pathname.startsWith("/account/password")) return "/account/password";
  if (pathname.startsWith("/account/sessions")) return "/account/sessions";
  if (pathname.startsWith("/account/passkeys")) return "/account/passkeys";

  return "/account";
}
