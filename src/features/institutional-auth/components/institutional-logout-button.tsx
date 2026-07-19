"use client";

import { LogOutIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@common/components/ui/button";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { institutionalUserKeys } from "@features/institutional-auth/utils/institutional-user-keys.util";

export function InstitutionalLogoutButton(): React.ReactElement {
  const queryClient = useQueryClient();

  function clearInstitutionalUser(): void {
    queryClient.removeQueries({ queryKey: institutionalUserKeys.ALL });
  }

  return (
    <form action={logoutInstitutional} className="mt-6">
      <Button type="submit" variant="outline" size="lg" className="w-full" onClick={clearInstitutionalUser}>
        <LogOutIcon data-icon="inline-start" />
        Cerrar sesión
      </Button>
    </form>
  );
}
