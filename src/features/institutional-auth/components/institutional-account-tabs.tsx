"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@common/utils/cn.util";

const ACCOUNT_TABS = [
  { title: "Perfil", url: "/account" },
  { title: "Contraseña", url: "/account/password" },
  { title: "Sesiones", url: "/account/sessions" },
] as const;

export function InstitutionalAccountTabs(): React.ReactElement {
  const pathname = usePathname();
  const activeUrl = getActiveTabUrl(pathname);

  return (
    <nav aria-label="Secciones de la cuenta" className="w-fit max-w-full">
      <div className="bg-muted text-muted-foreground flex flex-wrap items-center gap-0.5 rounded-lg p-[3px] text-sm font-medium">
        {ACCOUNT_TABS.map((tab) => {
          const isActive = tab.url === activeUrl;

          return (
            <Link
              key={tab.url}
              href={tab.url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-[30px] items-center rounded-md px-2.5 whitespace-nowrap transition-colors",
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

  return "/account";
}
