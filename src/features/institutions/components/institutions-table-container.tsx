import type { InstitutionPaginationParams } from "../utils/institution-pagination.util";

import { fetchInstitutions } from "../services/fetch-institutions.service";
import { InstitutionsTablePresentation } from "./institutions-table-presentation";

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
