import type { PeoplePaginationParams } from "../utils/people-pagination.util";
import { fetchPeople } from "../services/fetch-people.service";
import { PeopleTablePresentation } from "./people-table-presentation";

type PeopleTableContainerProps = PeoplePaginationParams & {
  institutionId: string;
};

export async function PeopleTableContainer(props: PeopleTableContainerProps): Promise<React.ReactElement> {
  const { institutionId, page, size, search, sort } = props;
  const data = await fetchPeople(institutionId, props);

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
