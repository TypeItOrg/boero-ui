import { InstitutionalSessionsTablePresentation } from "@features/institutional-auth/components/institutional-sessions-table-presentation";
import type { fetchInstitutionalSessions } from "@features/institutional-auth/services/fetch-institutional-sessions.service";

type InstitutionalSessionsTableContainerProps = {
  dataPromise: ReturnType<typeof fetchInstitutionalSessions>;
  page: number;
  size: number;
};

export async function InstitutionalSessionsTableContainer({
  dataPromise,
  page,
  size,
}: InstitutionalSessionsTableContainerProps): Promise<React.ReactElement> {
  const data = await dataPromise;

  return <InstitutionalSessionsTablePresentation key={`${page}-${size}`} data={data} page={page} size={size} />;
}
