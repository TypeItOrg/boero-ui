import { PlatformPeopleTablePresentation } from "@features/people/components/platform-people-table-presentation";
import type { fetchPlatformPeople } from "@features/people/services/fetch-platform-people.service";
import type { PlatformPeoplePaginationParams } from "@features/people/utils/platform-people-pagination.util";

type PlatformPeopleTableContainerProps = PlatformPeoplePaginationParams & {
  dataPromise: ReturnType<typeof fetchPlatformPeople>;
};

export async function PlatformPeopleTableContainer(props: PlatformPeopleTableContainerProps): Promise<React.ReactElement> {
  const { dataPromise, ...params } = props;
  const data = await dataPromise;

  return <PlatformPeopleTablePresentation key={`${params.page}-${params.size}`} data={data} {...params} />;
}
