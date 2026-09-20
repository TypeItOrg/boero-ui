"use client";

import { WAITLIST_REASON_LABELS } from "@features/course-enrollments/constants/course-enrollment.constants";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@common/components/ui/button";
import { EnrollmentApplicationCourseDialog } from "@features/enrollment-applications/components/enrollment-application-courses-management";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { CourseWaitlistEntry } from "@features/course-enrollments/types/course-waitlist-entry.types";
import { ClockIcon } from "lucide-react";

type CourseWaitlistTableProps = {
  entries: readonly CourseWaitlistEntry[];
  canEnroll?: boolean;
  institutionId?: string;
  scope?: AcademicScope;
};

export function CourseWaitlistTable({
  entries,
  canEnroll = false,
  institutionId,
  scope = AcademicScope.INSTITUTIONAL,
}: CourseWaitlistTableProps): React.ReactElement {
  const router = useRouter();
  const [selected, setSelected] = React.useState<CourseWaitlistEntry>();
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">Los cupos quedan libres hasta que confirmes una incorporación.</p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Actualizar cupos
        </Button>
      </div>
      <div className="relative h-full overflow-hidden rounded-lg border">
        <Table containerClassName="table-scrollbar" className="min-w-192">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <TableHead>Número</TableHead>
              <TableHead>Postulante</TableHead>
              <TableHead>Solicitud</TableHead>
              <TableHead>Motivo original</TableHead>
              <TableHead>Situación actual</TableHead>
              <TableHead>Turno preferido</TableHead>
              <TableHead>Acciones</TableHead>
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
                <TableCell>{entry.originalReason ? (WAITLIST_REASON_LABELS[entry.originalReason] ?? entry.originalReason) : "—"}</TableCell>
                <TableCell>{entry.hasCapacity ? "Cupo disponible" : "Sin cupos"}</TableCell>
                <TableCell>{entry.preferredShift ?? "—"}</TableCell>
                <TableCell>
                  {canEnroll ? (
                    <Button size="sm" disabled={!entry.hasCapacity} onClick={() => setSelected(entry)}>
                      Incorporar
                    </Button>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selected ? (
        <EnrollmentApplicationCourseDialog
          applicationId={selected.applicationId}
          course={selected.applicationCourse}
          institutionId={institutionId}
          scope={scope}
          open
          onOpenChange={(open) => {
            if (!open) {
              setSelected(undefined);
            }
          }}
          onResolved={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
