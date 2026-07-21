import type { InstitutionPaginationParams } from "@features/institutions/utils/institution-pagination.util";

import { fetchInstitutions } from "@features/institutions/services/fetch-institutions.service";
import { InstitutionsTablePresentation } from "@features/institutions/components/institutions-table-presentation";

type ContainerProps = InstitutionPaginationParams;

export async function InstitutionsTableContainer(params: ContainerProps): Promise<React.ReactElement> {
  const data = await fetchInstitutions(params);
  const { page, size, sort, search, active } = params;

  return (
    <InstitutionsTablePresentation
      key={`${page}-${size}`}
      data={data}
      page={page}
      size={size}
      sort={sort}
      search={search}
      active={active}
    />
  );
}
