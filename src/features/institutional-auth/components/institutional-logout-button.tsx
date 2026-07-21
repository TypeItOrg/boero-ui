import { LogOutIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";

export function InstitutionalLogoutButton(): React.ReactElement {
  return (
    <form action={logoutInstitutional} className="mt-6">
      <Button type="submit" variant="outline" size="lg" className="w-full">
        <LogOutIcon data-icon="inline-start" />
        Cerrar sesión
      </Button>
    </form>
  );
}
