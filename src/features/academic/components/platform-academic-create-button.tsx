"use client";

import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";

export function PlatformAcademicCreateButton({ label, resource }: { label: string; resource: AcademicCollectionResource }): React.ReactElement {
  return (
    <Button asChild size="lg" className="w-full">
      <ReturnToLink href={`/admin/${resource}/new`}>
        <PlusIcon data-icon="inline-start" />
        {label}
      </ReturnToLink>
    </Button>
  );
}
