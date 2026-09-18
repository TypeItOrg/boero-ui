import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HistoryIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { fetchCourseEnrollment, fetchCourseEnrollmentHistory } from "@features/course-enrollments/services/course-enrollment.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Detalle de cursada" };

export default async function CourseEnrollmentDetailPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const { id } = await params;
  const [enrollment, history] = await Promise.all([
    fetchCourseEnrollment(user.institutionId, id),
    fetchCourseEnrollmentHistory(user.institutionId, id),
  ]);

  if (!enrollment) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Detalle de cursada"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [id]: "Detalle de cursada" }} />}
      actions={<PlatformPageIcon icon={HistoryIcon} />}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="bg-muted/25">
          <CardHeader>
            <h2 className="font-semibold">Cursada</h2>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Detail label="Estudiante" value={enrollment.studentName} />
              <Detail label="Curso" value={enrollment.academicSpaceName} />
              <Detail label="Plan" value={enrollment.studyPlanName} />
              <Detail label="Nivel" value={enrollment.academicLevelName ?? "Sin nivel"} />
              <Detail label="Instrumento" value={enrollment.instrumentName ?? "—"} />
              <Detail label="Origen" value={enrollment.source === "APPLICATION" ? "Solicitud" : "Alta manual"} />
              <Detail label="Estado" value={<Badge>{enrollment.status}</Badge>} />
              <Detail label="Resultado académico" value={<Badge variant="outline">{enrollment.academicStatus}</Badge>} />
            </dl>
          </CardContent>
        </Card>

        <Card className="bg-muted/25">
          <CardHeader>
            <h2 className="font-semibold">Horarios vigentes</h2>
          </CardHeader>
          <CardContent>
            {enrollment.schedules.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay horarios registrados.</p>
            ) : (
              <ul className="grid gap-2 text-sm">
                {enrollment.schedules.map((schedule) => (
                  <li key={schedule.id} className="bg-background rounded-lg border px-3 py-2">
                    {schedule.dayOfWeek} · {schedule.startTime.slice(0, 5)}–{schedule.endTime.slice(0, 5)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/25 xl:col-span-2">
          <CardHeader>
            <h2 className="font-semibold">Historial</h2>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm">No hay movimientos históricos.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-180 text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Operación</th>
                      <th className="px-4 py-3">Cursada</th>
                      <th className="px-4 py-3">Resultado</th>
                      <th className="px-4 py-3">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="px-4 py-3">{new Date(item.changedAt).toLocaleString("es-AR")}</td>
                        <td className="px-4 py-3">{item.operation}</td>
                        <td className="px-4 py-3">
                          {item.previousStatus ?? "—"} → {item.newStatus ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {item.previousAcademicStatus ?? "—"} → {item.newAcademicStatus ?? "—"}
                        </td>
                        <td className="px-4 py-3">{item.reason ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PlatformPageShell>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement {
  return (
    <div>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
