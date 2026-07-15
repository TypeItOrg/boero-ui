import type { PeoplePaginationParams } from "../utils/people-pagination.util";
import type { fetchPeople } from "../services/fetch-people.service";
import { PeopleTablePresentation } from "./people-table-presentation";

type PeopleTableContainerProps = PeoplePaginationParams & {
  dataPromise: ReturnType<typeof fetchPeople>;
  institutionId: string;
};

export async function PeopleTableContainer(props: PeopleTableContainerProps): Promise<React.ReactElement> {
  const { dataPromise, institutionId, page, size, search, sort } = props;
  const data = await dataPromise;

  return (
    <PeopleTablePresentation
      key={`${page}-${size}`}
      data={data}
      institutionId={institutionId}
      page={page}
      size={size}
      search={search}
      sort={sort}
    />
  );
}
