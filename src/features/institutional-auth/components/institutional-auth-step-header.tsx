import type { ReactNode } from "react";
import Image from "next/image";

type InstitutionalAuthStepHeaderProps = {
  title: string;
  description: ReactNode;
};

export function InstitutionalAuthStepHeader({ title, description }: InstitutionalAuthStepHeaderProps): React.ReactElement {
  return (
    <header className="flex flex-col items-center space-y-1 text-center">
      <Image width={875} height={1202} src={"/boero-logo.webp"} alt={"Logo de la institución"} className="h-auto w-16 md:hidden" />
      <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
