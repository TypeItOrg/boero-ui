"use client";

import { LogOut } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";

export function PlatformLogoutButton() {
  const logout = useLogoutPlatform();

  return (
    <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending}>
      <LogOut className="mr-2 h-4 w-4" />
      {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
