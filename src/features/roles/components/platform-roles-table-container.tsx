import { PlatformRolesTablePresentation } from "@features/roles/components/platform-roles-table-presentation";
import type { fetchPlatformRoles } from "@features/roles/services/platform-role.service";
import type { PlatformRolesPaginationParams } from "@features/roles/utils/platform-role-pagination.util";

type PlatformRolesTableContainerProps = PlatformRolesPaginationParams & {
  dataPromise: ReturnType<typeof fetchPlatformRoles>;
};

export async function PlatformRolesTableContainer(
  props: PlatformRolesTableContainerProps,
): Promise<React.ReactElement> {
  const { dataPromise, ...params } = props;
  const data = await dataPromise;
  return <PlatformRolesTablePresentation data={data} {...params} />;
}
