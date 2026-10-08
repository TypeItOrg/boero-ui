"use client";

import type { ReactElement } from "react";

import { LibraryBigIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { TabsContent } from "@common/components/ui/tabs";

import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EnrollmentCoursesSelector } from "@features/enrollment-applications/components/EnrollmentCoursesSelector";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationCourse } from "@features/enrollment-applications/types/enrollment-application-course.types";
import type { EnrollmentWizardModel } from "@features/enrollment-applications/types/enrollment-wizard-model.types";
import { enrollmentCourseGroupKey } from "@features/enrollment-applications/utils/enrollment-course-group.util";

type Props = Pick<
  EnrollmentWizardModel,
  | "isMinor"
  | "selectedCourseIds"
  | "initialApplication"
  | "courseOptions"
  | "application"
  | "readOnly"
  | "isSubmitDialogOpen"
  | "isCancelDialogOpen"
  | "handleToggleCourse"
  | "handleSelectInstrument"
  | "pendingInstrumentGroups"
  | "invalidInstrumentGroups"
  | "handleToggleInstrumentGroup"
  | "getFieldError"
  | "hasMoreCourseOptions"
  | "loadingMoreCourses"
  | "loadMoreCourseOptions"
  | "courseOptionsError"
  | "handleActiveTabChange"
  | "setInvalidInstrumentGroups"
>;

export function EnrollmentCourseStep({
  isMinor,
  selectedCourseIds,
  initialApplication,
  courseOptions,
  application,
  readOnly,
  isSubmitDialogOpen,
  isCancelDialogOpen,
  handleToggleCourse,
  handleSelectInstrument,
  pendingInstrumentGroups,
  invalidInstrumentGroups,
  handleToggleInstrumentGroup,
  getFieldError,
  hasMoreCourseOptions,
  loadingMoreCourses,
  loadMoreCourseOptions,
  courseOptionsError,
  handleActiveTabChange,
  setInvalidInstrumentGroups,
}: Props): ReactElement {
  return (
    <TabsContent value="spaces" className="space-y-6">
      <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
        <EnrollmentStepCardHeader
          icon={LibraryBigIcon}
          title={isMinor ? "5. Cursos" : "4. Cursos"}
          description="Marcá los espacios que querés cursar y elegí el instrumento donde corresponda. Solo podés inscribirte si cumplís sus correlatividades."
        />
        <CardContent>
          {selectedCourseIds
            .filter((id) => {
              const saved = initialApplication.courses?.find((course) => course.courseId === id);

              return !courseOptions.some(
                (option) =>
                  option.courseId === id || (option.instrumental && saved && enrollmentCourseGroupKey(option) === enrollmentCourseGroupKey(saved)),
              );
            })
            .map((id) => {
              const selected = initialApplication.courses?.find((course) => course.courseId === id);

              const name = selected
                ? `${selected.academicSpaceName}${selected.instrumentName ? ` · ${selected.instrumentName}` : ""}`
                : "Curso seleccionado";

              const unavailableMessage = getCourseUnavailableMessage(selected);

              return (
                <div key={id} className="mb-3 flex items-center justify-between gap-3 rounded-lg border p-3">
                  <span>
                    {name}
                    {unavailableMessage ? <span className="text-destructive mt-1 block text-sm">{unavailableMessage}</span> : null}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!application.isEditable || readOnly || isSubmitDialogOpen || isCancelDialogOpen}
                    aria-label={`Quitar ${name}`}
                    onClick={() => handleToggleCourse(id, false)}
                  >
                    Quitar
                  </Button>
                </div>
              );
            })}
          {courseOptions.length > 0 ? (
            <EnrollmentCoursesSelector
              applicationId={application.applicationId}
              savedCourses={initialApplication.courses ?? []}
              onSelectInstrument={handleSelectInstrument}
              pendingInstrumentGroups={pendingInstrumentGroups}
              invalidInstrumentGroups={invalidInstrumentGroups}
              onToggleInstrumentGroup={handleToggleInstrumentGroup}
              courses={courseOptions}
              selectedCourseIds={selectedCourseIds}
              onToggleCourse={handleToggleCourse}
              disabled={!application.isEditable || readOnly || isSubmitDialogOpen || isCancelDialogOpen}
              error={getFieldError(["courses"])}
              hasMore={hasMoreCourseOptions}
              loadingMore={loadingMoreCourses}
              onLoadMore={loadMoreCourseOptions}
            />
          ) : (
            <Alert variant="destructive">
              <AlertTitle>No hay cursos disponibles</AlertTitle>
              <AlertDescription>La institución no tiene cursos activos para el trayecto y ciclo seleccionados.</AlertDescription>
            </Alert>
          )}
          {courseOptionsError ? (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{courseOptionsError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleActiveTabChange(isMinor ? "responsible" : "health")}
            className="gap-1.5"
          >
            Atrás
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => {
              if (pendingInstrumentGroups.length > 0) {
                setInvalidInstrumentGroups([...pendingInstrumentGroups]);
                document.getElementById(`instrument-${pendingInstrumentGroups[0]}`)?.focus();

                return;
              }

              handleActiveTabChange("preferences");
            }}
            className="gap-1.5"
          >
            Siguiente: Preferencias
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

function getCourseUnavailableMessage(course: EnrollmentApplicationCourse | undefined): string | undefined {
  if (course?.periodOpen === false) {
    return ENROLLMENT_MESSAGES.PERIOD_COURSE_CLOSED;
  }

  if (course?.withinPeriodScope === false) {
    return ENROLLMENT_MESSAGES.PERIOD_COURSE_EXCLUDED;
  }

  return undefined;
}
