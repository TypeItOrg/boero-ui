"use client";

import { LogOutIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";

export function PlatformLogoutButton() {
  const logout = useLogoutPlatform();

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
    >
      <LogOutIcon data-icon="inline-start" />
      <span className="group-data-[collapsible=icon]:hidden">
        {logout.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
      </span>
    </Button>
  );
}
