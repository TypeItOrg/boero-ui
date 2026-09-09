import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RouteIcon } from "lucide-react";

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
};

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de la oferta académica");
}

export default async function AcademicOfferDetailPage({ params }: AcademicOfferDetailPageProps): Promise<React.ReactElement> {
  const [user, { studyPlanId }] = await Promise.all([requireInstitutionalUser(), params]);

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
      <AcademicOfferDetail detail={detail} />
    </PlatformPageShell>
  );
}
