import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RouteIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicOfferDetail } from "@features/academic-offers/components/academic-offer-detail";
import { fetchAcademicOffer } from "@features/academic-offers/services/academic-offer.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type AcademicOfferDetailPageProps = {
  params: Promise<{ studyPlanId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de la oferta académica");
}

export default async function AcademicOfferDetailPage({ params, searchParams }: AcademicOfferDetailPageProps): Promise<React.ReactElement> {
  const [user, { studyPlanId }, { returnTo }] = await Promise.all([requireInstitutionalUser(), params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/academic-offers");

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_OFFER_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar la oferta académica de esta institución." />;
  }

  const detail = await fetchAcademicOffer(user.institutionId, studyPlanId);
  if (!detail) notFound();

  return (
    <PlatformPageShell
      title={detail.offer.trainingPathName}
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [studyPlanId]: detail.offer.trainingPathName }} />}
      actions={<PlatformPageIcon icon={RouteIcon} />}
    >
      <div className="flex items-center">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>Volver</Link>
        </Button>
      </div>
      <AcademicOfferDetail detail={detail} />
    </PlatformPageShell>
  );
}
