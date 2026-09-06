import { Skeleton } from "@common/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

export function EnrollmentApplicationTableSkeleton(): React.ReactElement {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-full overflow-hidden rounded-lg border">
        <Table containerClassName="table-scrollbar" className="min-w-190">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-36" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-5 w-36" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Skeleton className="h-8 w-full" />
    </div>
  );
}
