import type { fetchInstitutionTeachers } from "@features/people/services/fetch-institution-teachers.service";
import { TeachersTablePresentation } from "@features/people/components/teachers-table-presentation";
import type { TeachersPaginationParams } from "@features/people/utils/teachers-pagination.util";

type TeachersTableContainerProps = TeachersPaginationParams & {
  dataPromise: ReturnType<typeof fetchInstitutionTeachers>;
};

export async function TeachersTableContainer({ dataPromise, page, size, search, sort }: TeachersTableContainerProps): Promise<React.ReactElement> {
  const data = await dataPromise;

  return (
    <TeachersTablePresentation
      key={`${page}-${size}-${search}-${sort.field}-${sort.direction}`}
      data={data}
      page={page}
      size={size}
      search={search}
      sort={sort}
    />
  );
}
