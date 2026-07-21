"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useSidebar } from "@common/components/ui/sidebar";
import { MOBILE_SIDEBAR_CLOSE_DELAY_MS } from "@common/constants/sidebar.constants";

export type MobileSidebarNavigation = {
  handleNavigation: (url: string) => void;
  isActive: (url: string, exact?: boolean) => boolean;
};

export function useMobileSidebarNavigation(): MobileSidebarNavigation {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [pendingUrl, setPendingUrl] = useState<string>();
  const [navigatedFromPathname, setNavigatedFromPathname] = useState<string>();

  function clearPendingState(): void {
    setPendingUrl(undefined);
    setNavigatedFromPathname(undefined);
  }

  if (pendingUrl) {
    const hasPathnameChanged = navigatedFromPathname !== undefined && pathname !== navigatedFromPathname;
    const shouldResetOnRender = (!isMobile && pathname === pendingUrl) || (hasPathnameChanged && pathname !== pendingUrl);

    if (shouldResetOnRender) {
      clearPendingState();
    }
  }

  function handleNavigation(url: string): void {
    setPendingUrl(url);
    setNavigatedFromPathname(pathname);
  }

  function isActive(url: string, exact = false): boolean {
    if (pendingUrl) return pendingUrl === url;

    return exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
  }

  useEffect(() => {
    if (!isMobile || !pendingUrl || pathname !== pendingUrl) return;

    const timeoutId = window.setTimeout(() => {
      setOpenMobile(false);
      clearPendingState();
    }, MOBILE_SIDEBAR_CLOSE_DELAY_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isMobile, pathname, pendingUrl, setOpenMobile]);

  return { handleNavigation, isActive };
}
