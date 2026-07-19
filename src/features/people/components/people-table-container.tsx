import type { PeoplePaginationParams } from "../utils/people-pagination.util";
import type { fetchPeople } from "../services/fetch-people.service";
import { PeopleTablePresentation } from "./people-table-presentation";
import type { PeopleScope } from "../utils/people-scope.util";

type PeopleTableContainerProps = PeoplePaginationParams & {
  dataPromise: ReturnType<typeof fetchPeople>;
  institutionId: string;
  scope?: PeopleScope;
  selfPersonId?: string | null;
  canCreate?: boolean;
  canDelete?: boolean;
  canUpdateStatus?: boolean;
};

export async function PeopleTableContainer(props: PeopleTableContainerProps): Promise<React.ReactElement> {
  const {
    dataPromise,
    institutionId,
    page,
    size,
    search,
    sort,
    scope = "admin",
    selfPersonId,
    canCreate = true,
    canDelete = true,
    canUpdateStatus = false,
  } = props;
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
      scope={scope}
      selfPersonId={selfPersonId}
      canCreate={canCreate}
      canDelete={canDelete}
      canUpdateStatus={canUpdateStatus}
    />
  );
}
