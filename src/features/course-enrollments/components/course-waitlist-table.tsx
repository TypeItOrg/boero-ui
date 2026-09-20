import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { CourseWaitlistEntry } from "@features/course-enrollments/types/course-waitlist-entry.types";
import { ClockIcon } from "lucide-react";

type CourseWaitlistTableProps = {
  entries: readonly CourseWaitlistEntry[];
};

export function CourseWaitlistTable({ entries }: CourseWaitlistTableProps): React.ReactElement {
  if (entries.length === 0) {
    return (
      <Empty className="min-h-56 p-6">
        <EmptyHeader className="max-w-sm">
          <EmptyMedia variant="icon">
            <ClockIcon className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base">No hay personas en espera</EmptyTitle>
          <EmptyDescription>Cuando se agoten los cupos, las solicitudes en espera van a aparecer acá.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="relative h-full overflow-hidden rounded-lg border">
      <Table containerClassName="table-scrollbar" className="min-w-192">
        <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
          <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
            <TableHead>Número</TableHead>
            <TableHead>Estudiante</TableHead>
            <TableHead>Solicitud</TableHead>
            <TableHead>Motivo original</TableHead>
            <TableHead>Situación actual</TableHead>
            <TableHead>Turno preferido</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.applicationCourseId} className="hover:bg-muted/50 h-11 border-b transition-colors">
              <TableCell className="font-semibold">{entry.waitlistNumber}</TableCell>
              <TableCell>
                <div className="font-medium">{entry.applicantName}</div>
                <div className="text-muted-foreground">{entry.applicantDocumentNumber}</div>
              </TableCell>
              <TableCell>{new Date(entry.waitlistedAt).toLocaleDateString("es-AR")}</TableCell>
              <TableCell>{entry.originalReason ?? "—"}</TableCell>
              <TableCell>{entry.currentSituation}</TableCell>
              <TableCell>{entry.preferredShift ?? "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
