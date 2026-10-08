import type { ReactNode } from "react";
import { InstitutionalBrandIdentity } from "@features/institutional-auth/components/institutional-brand-identity";

type InstitutionalAuthStepHeaderProps = {
  title: string;
  description: ReactNode;
  showInstitutionName?: boolean;
};

export function InstitutionalAuthStepHeader({
  title,
  description,
  showInstitutionName = false,
}: InstitutionalAuthStepHeaderProps): React.ReactElement {
  return (
    <header className="flex flex-col items-center space-y-1 text-center">
      <InstitutionalBrandIdentity
        className="mb-3 w-full md:hidden"
        imageContainerClassName="h-16 sm:h-20 w-full"
        imageClassName="max-h-16 max-w-48 sm:max-h-20 sm:max-w-56"
        showInstitutionName={showInstitutionName}
      />
      <h1 className="text-xl font-bold text-balance break-words sm:text-2xl">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
