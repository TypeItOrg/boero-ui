import Link from "next/link";
import { HouseIcon, ShieldXIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@common/components/ui/empty";

type InstitutionalAccessDeniedProps = {
  description?: string;
};

export function InstitutionalAccessDenied({
  description = "No tenés permisos para acceder a esta sección de la institución.",
}: InstitutionalAccessDeniedProps): React.ReactElement {
  return (
    <Empty className="bg-background m-4 min-h-96 sm:m-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldXIcon />
        </EmptyMedia>
        <EmptyTitle>Sin acceso</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="lg">
          <Link href="/">
            <HouseIcon data-icon="inline-start" />
            Ir al inicio
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
