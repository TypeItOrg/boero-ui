import type { ReactNode } from "react";

import { InstitutionalAccountTabs } from "@features/institutional-auth/components/institutional-account-tabs";

type InstitutionalAccountHeaderProps = {
  actions?: ReactNode;
};

export function InstitutionalAccountHeader({ actions }: InstitutionalAccountHeaderProps): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <InstitutionalAccountTabs />
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
