import { Skeleton } from "@common/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

export function PlatformAccountsTableSkeleton(): React.ReactElement {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="h-full overflow-hidden rounded-lg border">
        <Table containerClassName="table-scrollbar" className="min-w-220">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              <TableHead className="w-16 pl-4" />
              {Array.from({ length: 5 }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="w-16 pl-4">
                  <Skeleton className="size-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-52" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-44 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
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
