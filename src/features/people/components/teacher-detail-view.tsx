import { Badge } from "@common/components/ui/badge";
import { TeacherWeeklySchedule } from "@features/people/components/teacher-weekly-schedule";
import type { TeacherDetail } from "@features/people/types/teacher-detail.types";

export function TeacherDetailView({ data }: { data: TeacherDetail }): React.ReactElement {
  const { person, courses } = data;
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {person.firstName} {person.lastName}
            </h2>
            <p className="text-muted-foreground text-sm">Documento: {person.documentNumber}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">Docente</Badge>
            <Badge variant={data.enabled ? "secondary" : "outline"}>{data.enabled ? "Activo" : "Inactivo"}</Badge>
          </div>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Email", person.email],
            ["Teléfono", person.phoneNumber],
            ["Institución", person.institutionName],
            ["Función", "Docente"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground text-xs uppercase">{label}</dt>
              <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <h2 className="font-semibold">Asignaciones académicas</h2>
        <p className="text-muted-foreground text-sm">Cursos, clases y horarios asignados.</p>
        <div className="mt-4 flex flex-col gap-3">
          {courses.length ? (
            courses.map((course) => (
              <article key={course.courseId} className="bg-background rounded-xl border p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{course.academicSpaceName}</h3>
                    <p className="text-muted-foreground text-sm">
                      {course.instrumentName ?? "Sin instrumento"} · Ciclo {course.academicYear}
                    </p>
                  </div>
                  <Badge variant="outline">{course.classes.length} clases</Badge>
                </div>
                {course.classes.map((courseClass) => (
                  <div key={courseClass.id} className="mt-4 border-t pt-3">
                    <h4 className="text-sm font-semibold">Clase {courseClass.classNumber}</h4>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {courseClass.days.flatMap((day) =>
                        day.schedules.map((schedule) => (
                          <span key={`${courseClass.id}-${day.dayOfWeek}-${schedule.startTime}`} className="text-muted-foreground text-sm">
                            {formatDay(day.dayOfWeek)}: {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                          </span>
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </article>
            ))
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">Este docente no tiene asignaciones.</p>
          )}
        </div>
      </section>
      <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <h2 className="font-semibold">Vista semanal</h2>
        <p className="text-muted-foreground text-sm">Franjas ocupadas por clases asignadas.</p>
        <div className="mt-4">
          <TeacherWeeklySchedule courses={courses} />
        </div>
      </section>
    </div>
  );
}

function formatDay(day: string): string {
  return (
    ({ MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles", THURSDAY: "Jueves", FRIDAY: "Viernes" } as Record<string, string>)[day] ?? day
  );
}
