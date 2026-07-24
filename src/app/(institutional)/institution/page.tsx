import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PencilIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { fetchInstitutionalInstitution } from "@features/institutions/services/fetch-institutional-institution.service";
import { InstitutionalInstitutionDetail } from "@features/institutions/components/institutional-institution-detail";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mi institución");
}

export default async function InstitutionalInstitutionPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_READ)) {
    return <InstitutionalAccessDenied />;
  }

  const institution = await fetchInstitutionalInstitution(user.institutionId);
  if (!institution) {
    notFound();
  }

  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.INSTITUTION_UPDATE);

  return (
    <PlatformPageShell
      title={institution.name}
      description="Detalles e información general de tu institución."
      breadcrumb={<InstitutionalBreadcrumb />}
      minViewportHeight
      actions={
        canUpdate ? (
          <Button asChild size="lg" className="w-full">
            <Link href="/institution/edit">
              <PencilIcon className="size-4" />
              <span>Editar información</span>
            </Link>
          </Button>
        ) : undefined
      }
    >
      <InstitutionalInstitutionDetail institution={institution} />
    </PlatformPageShell>
  );
}
