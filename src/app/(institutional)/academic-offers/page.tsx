import type { Metadata } from "next";
import { RouteIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import type { PaginationSearchParams } from "@common/types/pagination-search-params.types";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { AcademicOfferList } from "@features/academic-offers/components/academic-offer-list";
import { fetchAcademicOffers } from "@features/academic-offers/services/academic-offer.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Oferta académica");
}

export default async function AcademicOffersPage({ searchParams }: { searchParams: Promise<PaginationSearchParams> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ACADEMIC_OFFER_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar la oferta académica de esta institución." />;
  }

  const { page, size } = parsePaginationQuery(await searchParams);
  const offers = await fetchAcademicOffers(user.institutionId, { page, size });

  return (
    <PlatformPageShell title="Oferta académica" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={RouteIcon} />}>
      <DataTableNavigationProvider>
        <AcademicOfferList {...offers} />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
