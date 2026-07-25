import type { PeoplePaginationParams } from "@features/people/utils/people-pagination.util";
import type { fetchPeople } from "@features/people/services/fetch-people.service";
import { PeopleTablePresentation } from "@features/people/components/people-table-presentation";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

type PeopleTableContainerProps = PeoplePaginationParams & {
  dataPromise: ReturnType<typeof fetchPeople>;
  institutionId: string;
  scope?: PeopleScopeType;
  selfPersonId?: string | null;
  canCreate?: boolean;
  canUpdate?: boolean;
  canManageRoles?: boolean;
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
    scope = PeopleScope.ADMIN,
    selfPersonId,
    canCreate = true,
    canUpdate = true,
    canManageRoles = false,
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
      canUpdate={canUpdate}
      canManageRoles={canManageRoles}
      canDelete={canDelete}
      canUpdateStatus={canUpdateStatus}
    />
  );
}
