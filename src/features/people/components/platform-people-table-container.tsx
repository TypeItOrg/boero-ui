import { PlatformPeopleTablePresentation } from "@features/people/components/platform-people-table-presentation";
import { fetchPlatformPeople } from "@features/people/services/fetch-platform-people.service";
import type { PlatformPeoplePaginationParams } from "@features/people/utils/platform-people-pagination.util";

export async function PlatformPeopleTableContainer(
  params: PlatformPeoplePaginationParams,
): Promise<React.ReactElement> {
  const data = await fetchPlatformPeople(params);

  return <PlatformPeopleTablePresentation key={`${params.page}-${params.size}`} data={data} {...params} />;
}
