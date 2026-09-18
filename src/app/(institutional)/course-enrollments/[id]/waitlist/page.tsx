import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { fetchCourseWaitlist } from "@features/course-enrollments/services/course-enrollment.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { ClipboardListIcon } from "lucide-react";

export const metadata: Metadata = { title: "Lista de espera" };

export default async function CourseWaitlistPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const { id } = await params;
  const entries = await fetchCourseWaitlist(user.institutionId, id);

  if (!entries) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Lista de espera"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [id]: "Lista de espera" }} />}
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      {entries.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">No hay personas en espera.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-192 text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Estudiante</th>
                <th className="px-4 py-3">Solicitud</th>
                <th className="px-4 py-3">Motivo original</th>
                <th className="px-4 py-3">Turno preferido</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.applicationCourseId} className="border-t">
                  <td className="px-4 py-3 font-semibold">{entry.waitlistNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{entry.applicantName}</div>
                    <div className="text-muted-foreground">{entry.applicantDocumentNumber}</div>
                  </td>
                  <td className="px-4 py-3">{new Date(entry.waitlistedAt).toLocaleDateString("es-AR")}</td>
                  <td className="px-4 py-3">{entry.originalReason ?? "—"}</td>
                  <td className="px-4 py-3">{entry.preferredShift ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PlatformPageShell>
  );
}
