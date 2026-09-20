"use client";

import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  AlertTriangleIcon,
  BanIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  FileClockIcon,
  LibraryBigIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Button } from "@common/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldLabel, FieldDescription, FieldError } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { HorizontalScrollArea } from "@common/components/ui/horizontal-scroll-area";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Switch } from "@common/components/ui/switch";
import { Textarea } from "@common/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@common/components/ui/tabs";
import { EnrollmentCancelDialog } from "@features/enrollment-applications/components/enrollment-cancel-dialog";
import { EnrollmentSubmitDialog } from "@features/enrollment-applications/components/enrollment-submit-dialog";
import { unwrapEnrollmentResult } from "@features/enrollment-applications/utils/unwrap-enrollment-result.util";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import {
  updateEnrollmentDraftAction,
  submitEnrollmentApplicationAction,
} from "@features/enrollment-applications/actions/enrollment-application.actions";
import { calculateAge, enrollmentApplicationSubmissionSchema } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import { EDUCATION_LEVEL_OPTIONS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import { EnrollmentCoursesSelector } from "@features/enrollment-applications/components/EnrollmentCoursesSelector";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { fetchEnrollmentCourses } from "@features/enrollment-applications/services/enrollment-spaces-client.service";
import type { Shift } from "@features/academic/types/shift.types";
import type { EnrollmentApplicationData } from "@features/enrollment-applications/types/enrollment-application-data.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";
import type { z } from "zod";

interface EnrollmentWizardProps {
  initialApplication: EnrollmentApplicationResponse;
  initialShifts?: readonly Shift[];
  initialCourseOptions?: readonly EnrollmentCourseOption[];
  initialCourseOptionsPage?: number;
  initialCourseOptionsTotalPages?: number;
  readOnly?: boolean;
  returnTo?: string;
}

const READ_ONLY_INPUT_CLASS_NAME = "bg-muted/50 text-muted-foreground";

function subscribeToHydration(): () => void {
  return () => undefined;
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

// Maps a Zod issue path to the id of the input it corresponds to, so the
// first invalid field can be focused after a failed submission jumps to
// its tab.
const FIELD_ID_BY_ERROR_PATH: Record<string, string> = {
  "personalData.firstName": "firstName",
  "personalData.lastName": "lastName",
  "personalData.documentNumber": "documentNumber",
  "personalData.birthDate": "birthDate",
  "personalData.phoneNumber": "phoneNumber",
  "personalData.email": "email",
  "academicBackground.secondarySchool": "secondarySchool",
  "healthInclusion.adjustmentDetails": "adjustmentDetails",
  "responsible.fullName": "responsibleFullName",
  "responsible.documentNumber": "responsibleDocumentNumber",
  "responsible.phoneNumber": "responsiblePhoneNumber",
  "responsible.email": "responsibleEmail",
  "responsible.occupation": "responsibleOccupation",
  "responsible.educationLevel": "responsibleEducationLevel",
  "preference.preferredShift": "preferredShift",
  "preference.previousTeacher": "previousTeacher",
};

function parseInitialBirthDate(value: string | null | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00`);

  return isValid(date) ? date : undefined;
}

export function EnrollmentWizard({
  initialApplication,
  initialShifts = [],
  initialCourseOptions = [],
  initialCourseOptionsPage = 0,
  initialCourseOptionsTotalPages = 1,
  readOnly = false,
  returnTo = "/my-enrollment-applications",
}: EnrollmentWizardProps): React.ReactElement {
  const searchParams = useSearchParams();
  const initialData = initialApplication.data;
  const [application, setApplication] = React.useState<EnrollmentApplicationResponse>(initialApplication);
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    const requestedTab = searchParams.get("tab");

    return requestedTab === "training-path" ? "spaces" : requestedTab || "personal";
  });
  const hydrated = React.useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydrationSnapshot);

  // Status flags
  const [autosaveState, saveDraft, saving] = React.useActionState(
    async (_previous: { error?: string }, save: () => Promise<{ error?: string }>) => save(),
    {},
  );
  const draftSaveQueue = React.useRef<Promise<void>>(Promise.resolve());
  const autosaveInitializedRef = React.useRef(false);
  const lastSavedDataRef = React.useRef<string | null>(null);
  const tabTriggerRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const hasCenteredInitialTabRef = React.useRef(false);
  const saveError = autosaveState.error;
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = React.useState(false);
  const [pendingFocusFieldId, setPendingFocusFieldId] = React.useState<string | null>(null);

  // 1. Datos Personales
  const firstName = initialData?.personalData?.firstName ?? "";
  const lastName = initialData?.personalData?.lastName ?? "";
  const documentNumber = initialData?.personalData?.documentNumber ?? "";
  const birthDate = parseInitialBirthDate(initialData?.personalData?.birthDate);
  const phoneNumber = initialData?.personalData?.phoneNumber ?? "";
  const email = initialData?.personalData?.email ?? "";

  // 2. Escolaridad de Base
  const [secondarySchool, setSecondarySchool] = React.useState(initialData?.academicBackground?.secondarySchool ?? "");
  const [currentGradeYear, setCurrentGradeYear] = React.useState(
    initialData?.academicBackground?.currentGradeYear ? String(initialData.academicBackground.currentGradeYear) : "",
  );
  const [secondaryCompleted, setSecondaryCompleted] = React.useState(Boolean(initialData?.academicBackground?.secondaryCompleted));
  const [secondaryDegreeTitle, setSecondaryDegreeTitle] = React.useState(initialData?.academicBackground?.secondaryDegreeTitle ?? "");

  // 3. Salud e Inclusión
  const [receivesReasonableAdjustments, setReceivesReasonableAdjustments] = React.useState(
    Boolean(initialData?.healthInclusion?.receivesReasonableAdjustments),
  );
  const [adjustmentDetails, setAdjustmentDetails] = React.useState(initialData?.healthInclusion?.adjustmentDetails ?? "");

  // 4. Responsable / Tutor Legal
  const [responsibleFullName, setResponsibleFullName] = React.useState(initialData?.responsible?.fullName ?? "");
  const [responsibleDocumentNumber, setResponsibleDocumentNumber] = React.useState(initialData?.responsible?.documentNumber ?? "");
  const [responsiblePhoneNumber, setResponsiblePhoneNumber] = React.useState(initialData?.responsible?.phoneNumber ?? "");
  const [responsibleEmail, setResponsibleEmail] = React.useState(initialData?.responsible?.email ?? "");
  const [responsibleOccupation, setResponsibleOccupation] = React.useState(initialData?.responsible?.occupation ?? "");
  const [responsibleEducationLevel, setResponsibleEducationLevel] = React.useState(initialData?.responsible?.educationLevel ?? "");

  // 5. Trayecto Formativo (resolved when the application starts)
  const selectedTrainingPathId = initialData?.careerSelection?.trainingPathId ?? "";

  // 6. Cursos
  const [courseOptions, setCourseOptions] = React.useState<EnrollmentCourseOption[]>(() => [...initialCourseOptions]);
  const [courseOptionsPage, setCourseOptionsPage] = React.useState(initialCourseOptionsPage);
  const [courseOptionsTotalPages, setCourseOptionsTotalPages] = React.useState(initialCourseOptionsTotalPages);
  const [loadingMoreCourses, setLoadingMoreCourses] = React.useState(false);
  const [courseOptionsError, setCourseOptionsError] = React.useState<string>();
  const [selectedCourseIds, setSelectedCourseIds] = React.useState<string[]>(() => (initialData?.courses ?? []).map((course) => course.courseId));

  // 7. Preferencias
  const [preferredShift, setPreferredShift] = React.useState(initialData?.preference?.preferredShift ?? "");
  const shiftOptions = React.useMemo(() => {
    const options = initialShifts.map((shift) => ({ value: shift.name, label: shift.name }));

    if (preferredShift && !options.some((option) => option.value === preferredShift)) {
      return [{ value: preferredShift, label: preferredShift }, ...options];
    }

    return options;
  }, [initialShifts, preferredShift]);
  const [allowsImageUse, setAllowsImageUse] = React.useState(Boolean(initialData?.preference?.allowsImageUse));
  const [isReenrolling, setIsReenrolling] = React.useState(Boolean(initialData?.preference?.isReenrolling));
  const [previousTeacher, setPreviousTeacher] = React.useState(initialData?.preference?.previousTeacher ?? "");

  const hasMoreCourseOptions = courseOptionsPage + 1 < courseOptionsTotalPages;

  async function loadMoreCourseOptions(): Promise<void> {
    if (loadingMoreCourses || !hasMoreCourseOptions) {
      return;
    }

    setLoadingMoreCourses(true);
    setCourseOptionsError(undefined);

    try {
      const nextPage = await fetchEnrollmentCourses(application.applicationId, {
        page: courseOptionsPage + 1,
        size: 50,
      });
      setCourseOptions((previous) => [...previous, ...nextPage.items]);
      setCourseOptionsPage(nextPage.page);
      setCourseOptionsTotalPages(nextPage.totalPages);
    } catch (error: unknown) {
      setCourseOptionsError(error instanceof Error ? error.message : "No se pudieron cargar más cursos.");
    } finally {
      setLoadingMoreCourses(false);
    }
  }

  // Reactive age computation
  const calculatedAge = React.useMemo(() => {
    return calculateAge(birthDate);
  }, [birthDate]);

  const isMinor = calculatedAge !== null && calculatedAge < 18;

  const visibleTabs = React.useMemo(() => {
    const rawTabs = [
      { id: "personal", label: "Datos Personales" },
      { id: "education", label: "Escolaridad" },
      { id: "health", label: "Salud e Inclusión" },
      ...(isMinor ? [{ id: "responsible", label: "Tutor Legal" }] : []),
      { id: "spaces", label: "Cursos" },
      { id: "preferences", label: "Preferencias" },
    ];

    return rawTabs.map((tab, index) => ({
      ...tab,
      label: `${index + 1}. ${tab.label}`,
    }));
  }, [isMinor]);

  const effectiveActiveTab = !isMinor && activeTab === "responsible" ? "spaces" : activeTab;

  React.useLayoutEffect(() => {
    if (!hydrated) {
      return;
    }

    const activeTrigger = tabTriggerRefs.current.get(effectiveActiveTab);

    if (!activeTrigger) {
      return;
    }

    activeTrigger.scrollIntoView({
      behavior: hasCenteredInitialTabRef.current ? "smooth" : "auto",
      block: "nearest",
      inline: "center",
    });
    hasCenteredInitialTabRef.current = true;
  }, [effectiveActiveTab, hydrated]);

  function handleActiveTabChange(nextTab: string): void {
    setActiveTab(nextTab);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", nextTab);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;

    window.history.replaceState(null, "", nextUrl);
  }

  // Focus the first invalid field once its tab has mounted after a failed
  // submission (the tab switch and this focus request commit together).
  React.useEffect(() => {
    if (!pendingFocusFieldId) {
      return;
    }

    const fieldId = pendingFocusFieldId;
    // The newly active TabsContent panel mounts through Radix's own Presence
    // state machine, which settles a render pass after this effect runs, so
    // the field isn't in the DOM yet here — defer the lookup a tick.
    const timeoutId = window.setTimeout(() => {
      document.getElementById(fieldId)?.focus();
      setPendingFocusFieldId(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pendingFocusFieldId, effectiveActiveTab]);

  const handleToggleCourse = (courseId: string, checked: boolean) => {
    setSelectedCourseIds((previous) => (checked ? Array.from(new Set([...previous, courseId])) : previous.filter((id) => id !== courseId)));
  };

  const structuredData: EnrollmentApplicationData = React.useMemo(() => {
    return {
      personalData: {
        firstName,
        lastName,
        documentNumber,
        birthDate: birthDate && isValid(birthDate) ? format(birthDate, "yyyy-MM-dd") : null,
        phoneNumber,
        email,
      },
      academicBackground: {
        secondarySchool,
        currentGradeYear,
        secondaryCompleted,
        secondaryDegreeTitle,
      },
      healthInclusion: {
        receivesReasonableAdjustments,
        adjustmentDetails,
      },
      responsible: {
        fullName: responsibleFullName,
        documentNumber: responsibleDocumentNumber,
        phoneNumber: responsiblePhoneNumber,
        email: responsibleEmail,
        occupation: responsibleOccupation,
        educationLevel: responsibleEducationLevel,
      },
      careerSelection: selectedTrainingPathId ? { trainingPathId: selectedTrainingPathId } : undefined,
      courses: selectedCourseIds.map((courseId) => ({
        courseId,
        preferredTeacherId: initialData?.courses?.find((course) => course.courseId === courseId)?.preferredTeacherId ?? null,
      })),
      preference: {
        preferredShift,
        allowsImageUse,
        isReenrolling,
        previousTeacher,
      },
    };
  }, [
    firstName,
    lastName,
    documentNumber,
    birthDate,
    phoneNumber,
    email,
    secondarySchool,
    currentGradeYear,
    secondaryCompleted,
    secondaryDegreeTitle,
    receivesReasonableAdjustments,
    adjustmentDetails,
    responsibleFullName,
    responsibleDocumentNumber,
    responsiblePhoneNumber,
    responsibleEmail,
    responsibleOccupation,
    responsibleEducationLevel,
    selectedTrainingPathId,
    initialData?.courses,
    selectedCourseIds,
    preferredShift,
    allowsImageUse,
    isReenrolling,
    previousTeacher,
  ]);

  const [validationIssues, setValidationIssues] = React.useState<z.ZodIssue[]>([]);

  const debouncedData = useDebouncedValue(structuredData, 800);
  const debouncedDataIsCurrent = JSON.stringify(debouncedData) === JSON.stringify(structuredData);
  const autosaveTarget =
    application?.status === ENROLLMENT_APPLICATION_STATUS.DRAFT &&
    !readOnly &&
    !isSubmitDialogOpen &&
    !isCancelDialogOpen &&
    debouncedDataIsCurrent &&
    debouncedData.careerSelection?.trainingPathId === (selectedTrainingPathId || undefined)
      ? application.applicationId
      : null;

  // Auto-save logic
  React.useEffect(() => {
    if (!autosaveTarget) {
      return;
    }

    const targetApplicationId = autosaveTarget;
    const dataSignature = JSON.stringify(debouncedData);

    if (!autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      lastSavedDataRef.current = dataSignature;

      return;
    }

    if (lastSavedDataRef.current === dataSignature) {
      return;
    }

    let active = true;

    async function autoSave(): Promise<{ error?: string }> {
      await Promise.resolve();

      if (!active) {
        return {};
      }

      try {
        const request = draftSaveQueue.current.then(() => {
          if (!active) {
            return null;
          }

          return updateEnrollmentDraftAction(targetApplicationId, { data: debouncedData }).then(unwrapEnrollmentResult);
        });
        draftSaveQueue.current = request.then(
          () => undefined,
          () => undefined,
        );
        const updated = await request;

        if (active && updated) {
          lastSavedDataRef.current = dataSignature;
          setApplication((prev) => (prev ? { ...prev, updatedAt: updated.updatedAt } : updated));
        }
      } catch (err: unknown) {
        if (active) {
          return { error: err instanceof Error ? err.message : ENROLLMENT_MESSAGES.DRAFT_SAVE_FAILED };
        }
      }

      return {};
    }

    React.startTransition(() => saveDraft(autoSave));

    return () => {
      active = false;
    };
  }, [autosaveTarget, debouncedData, saveDraft]);

  async function submitApplication(): Promise<{ error?: string; issues?: z.ZodIssue[] }> {
    if (!application?.applicationId || isCancelDialogOpen) {
      return {};
    }

    setValidationIssues([]);

    const parsed = enrollmentApplicationSubmissionSchema.safeParse(structuredData);
    const issues: z.ZodIssue[] = parsed.success ? [] : [...parsed.error.issues];

    if (!selectedTrainingPathId) {
      issues.push({ code: "custom", message: ENROLLMENT_MESSAGES.TRAINING_PATH_REQUIRED, path: ["careerSelection", "trainingPathId"] });
    }

    if (selectedCourseIds.length === 0) {
      issues.push({ code: "custom", message: ENROLLMENT_MESSAGES.SPACE_REQUIRED, path: ["courses"] });
    }

    if (issues.length > 0) {
      setValidationIssues(issues);
      // Auto-navigate to the first invalid step and focus its field
      const firstIssue = issues[0];

      if (firstIssue && firstIssue.path.length > 0) {
        const section = firstIssue.path[0];

        if (section === "personalData") {
          handleActiveTabChange("personal");
        } else if (section === "academicBackground") {
          handleActiveTabChange("education");
        } else if (section === "healthInclusion") {
          handleActiveTabChange("health");
        } else if (section === "responsible" && isMinor) {
          handleActiveTabChange("responsible");
        } else if (section === "careerSelection" || section === "courses") {
          handleActiveTabChange("spaces");
        } else if (section === "preference") {
          handleActiveTabChange("preferences");
        }

        const fieldId = FIELD_ID_BY_ERROR_PATH[firstIssue.path.join(".")];

        if (fieldId) {
          setPendingFocusFieldId(fieldId);
        }
      }

      return { issues };
    }

    try {
      await draftSaveQueue.current;
      await updateEnrollmentDraftAction(application.applicationId, { data: structuredData }).then(unwrapEnrollmentResult);
      setApplication(await submitEnrollmentApplicationAction(application.applicationId).then(unwrapEnrollmentResult));

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : ENROLLMENT_MESSAGES.SUBMISSION_FAILED };
    }
  }

  // Helpers to query validation errors by path
  const getFieldError = (path: (string | number)[]): string | undefined => {
    const issue = validationIssues.find((iss) => {
      if (iss.path.length !== path.length) {
        return false;
      }

      return iss.path.every((val, idx) => val === path[idx]);
    });

    return issue?.message;
  };

  // If application is no longer in draft (SUBMITTED, APPROVED, REJECTED, CANCELLED), render read-only status view
  if (application.status !== ENROLLMENT_APPLICATION_STATUS.DRAFT) {
    return <EnrollmentStatusCard application={application} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={returnTo}>Volver</Link>
        </Button>

        {!readOnly && (
          <Button type="button" variant="destructive" size="lg" onClick={() => setIsCancelDialogOpen(true)}>
            <BanIcon className="size-4" />
            Cancelar
          </Button>
        )}
      </div>

      {readOnly && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangleIcon className="size-4 text-amber-600" />
          <AlertTitle className="text-amber-900">Solicitud de inscripción - Visualización</AlertTitle>
          <AlertDescription className="text-amber-800">
            Esta solicitud ya ha sido enviada y no se puede modificar. Los datos que ves a continuación son solo de referencia.
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-6">
        <div className="flex items-stretch gap-3.5">
          <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
            <FileClockIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col justify-center gap-1">
            <p className="font-heading text-sm font-medium">Solicitud en borrador</p>
            <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm" aria-live="polite" aria-atomic="true">
              {saving ? (
                <>
                  <Loader2Icon className="text-primary size-4 animate-spin" />
                  <span>Guardando cambios…</span>
                </>
              ) : saveError ? (
                <span className="text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="size-4" />
                  Error al guardar
                </span>
              ) : (
                <>
                  <CheckCircle2Icon className="size-4 text-emerald-500" />
                  <span>Borrador guardado</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {validationIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{ENROLLMENT_MESSAGES.INCOMPLETE_FIELDS_TITLE(validationIssues.length)}</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs navigation */}
      <Tabs
        value={effectiveActiveTab}
        onValueChange={handleActiveTabChange}
        className="w-full gap-3 [&_[data-slot=card-footer]_[data-slot=button]]:h-auto [&_[data-slot=card-footer]_[data-slot=button]]:min-h-9 [&_[data-slot=card-footer]_[data-slot=button]]:w-full [&_[data-slot=card-footer]_[data-slot=button]]:max-w-full [&_[data-slot=card-footer]_[data-slot=button]]:py-2 [&_[data-slot=card-footer]_[data-slot=button]]:text-center [&_[data-slot=card-footer]_[data-slot=button]]:whitespace-normal sm:[&_[data-slot=card-footer]_[data-slot=button]]:h-9 sm:[&_[data-slot=card-footer]_[data-slot=button]]:w-auto sm:[&_[data-slot=card-footer]_[data-slot=button]]:whitespace-nowrap"
      >
        {hydrated ? (
          <HorizontalScrollArea>
            <TabsList className="flex h-[52px]! w-max min-w-full gap-1 p-1">
              {visibleTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  ref={(element) => {
                    if (element) {
                      tabTriggerRefs.current.set(tab.id, element);
                    } else {
                      tabTriggerRefs.current.delete(tab.id);
                    }
                  }}
                  value={tab.id}
                  className="h-10! min-w-44 flex-[1_0_auto] px-5 py-2 text-center text-sm group-data-[overflow=true]/horizontal-scroll-area:h-11!"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </HorizontalScrollArea>
        ) : (
          <div
            className="bg-muted flex h-[52px] w-full animate-pulse items-center gap-1 rounded-lg p-1"
            role="status"
            aria-label="Preparando pasos de la inscripción"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <span key={index} className="bg-background/70 h-10 flex-1 rounded-md" />
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 1: DATOS PERSONALES Y CONTACTO */}
        {/* ========================================================================= */}
        <TabsContent value="personal" className="space-y-6">
          <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
            <EnrollmentStepCardHeader
              icon={UserRoundIcon}
              title="1. Datos Personales y Contacto"
              description={
                <>
                  Actualizá tus datos desde{" "}
                  <ReturnToLink href="/account/edit" className="underline underline-offset-4">
                    Cuenta
                  </ReturnToLink>
                  ; para cambiar el documento, contactá a la institución.
                </>
              }
            />
            <CardContent className="space-y-4">
              <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "firstName"])}>
                  <FieldLabel htmlFor="firstName" required>
                    Nombre
                  </FieldLabel>
                  <Input
                    id="firstName"
                    value={firstName}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="Juan"
                    autoComplete="given-name"
                    aria-invalid={!!getFieldError(["personalData", "firstName"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "firstName"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "lastName"])}>
                  <FieldLabel htmlFor="lastName" required>
                    Apellido
                  </FieldLabel>
                  <Input
                    id="lastName"
                    value={lastName}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="Pérez"
                    autoComplete="family-name"
                    aria-invalid={!!getFieldError(["personalData", "lastName"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "lastName"]) }]} />
                </Field>
              </div>

              <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "documentNumber"])}>
                  <FieldLabel htmlFor="documentNumber" required>
                    Documento Nacional de Identidad
                  </FieldLabel>
                  <NumericInput
                    id="documentNumber"
                    maxLength={8}
                    value={documentNumber}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="12345678"
                    aria-invalid={!!getFieldError(["personalData", "documentNumber"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "documentNumber"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "birthDate"])}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <FieldLabel htmlFor="birthDate" required>
                      Fecha de nacimiento
                    </FieldLabel>
                    {calculatedAge !== null && (
                      <Badge variant={isMinor ? "destructive" : "outline"} size="lg" className="w-full justify-center sm:w-auto">
                        {calculatedAge} años {isMinor ? "(Menor de 18)" : "(Mayor de edad)"}
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="birthDate"
                    value={birthDate && isValid(birthDate) ? format(birthDate, "dd/MM/yyyy") : ""}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="dd/mm/aaaa"
                    aria-invalid={!!getFieldError(["personalData", "birthDate"])}
                  />
                  {isMinor && (
                    <FieldDescription className="text-xs text-amber-600 dark:text-amber-400">
                      Al ser menor de 18 años, deberás completar los datos del tutor en el paso 4.
                    </FieldDescription>
                  )}
                  <FieldError errors={[{ message: getFieldError(["personalData", "birthDate"]) }]} />
                </Field>
              </div>

              <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "phoneNumber"])}>
                  <FieldLabel htmlFor="phoneNumber">Teléfono de contacto</FieldLabel>
                  <PhoneInput
                    id="phoneNumber"
                    value={phoneNumber}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="3534123456"
                    autoComplete="tel"
                    aria-invalid={!!getFieldError(["personalData", "phoneNumber"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "phoneNumber"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "email"])}>
                  <FieldLabel htmlFor="email" required>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className={READ_ONLY_INPUT_CLASS_NAME}
                    placeholder="postulante@ejemplo.com"
                    autoComplete="email"
                    spellCheck={false}
                    aria-invalid={!!getFieldError(["personalData", "email"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "email"]) }]} />
                </Field>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" size="lg" onClick={() => handleActiveTabChange("education")} className="w-full gap-1.5 sm:w-auto">
                Siguiente: Escolaridad
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 2: ESCOLARIDAD DE BASE */}
        {/* ========================================================================= */}
        <TabsContent value="education" className="space-y-6">
          <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
            <EnrollmentStepCardHeader
              icon={GraduationCapIcon}
              title="2. Escolaridad de Base"
              description="Antecedentes de escolaridad y nivel de egreso secundario."
            />
            <CardContent className="space-y-4">
              <Field data-invalid={!!getFieldError(["academicBackground", "secondarySchool"])}>
                <FieldLabel htmlFor="secondarySchool" required>
                  Colegio secundario de origen
                </FieldLabel>
                <Input
                  id="secondarySchool"
                  value={secondarySchool}
                  onChange={(e) => setSecondarySchool(e.target.value)}
                  placeholder="Escuela Normal Superior Víctor Mercante"
                  aria-invalid={!!getFieldError(["academicBackground", "secondarySchool"])}
                />
                <FieldError errors={[{ message: getFieldError(["academicBackground", "secondarySchool"]) }]} />
              </Field>

              <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="currentGradeYear">Año de cursado o egreso (opcional)</FieldLabel>
                  <NumericInput
                    id="currentGradeYear"
                    maxLength={4}
                    value={currentGradeYear}
                    onChange={(e) => setCurrentGradeYear(e.target.value)}
                    placeholder="2024"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="secondaryDegreeTitle">Título o especialidad obtenida (opcional)</FieldLabel>
                  <Input
                    id="secondaryDegreeTitle"
                    value={secondaryDegreeTitle}
                    onChange={(e) => setSecondaryDegreeTitle(e.target.value)}
                    placeholder="Bachiller en Arte y Música"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <FieldLabel htmlFor="secondaryCompleted" className="text-sm font-medium">
                    ¿Secundario completo?
                  </FieldLabel>
                  <FieldDescription>Indicá si ya finalizaste todos los estudios secundarios y tenés título o constancia de egreso.</FieldDescription>
                </div>
                <Switch id="secondaryCompleted" size="lg" checked={secondaryCompleted} onCheckedChange={setSecondaryCompleted} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("personal")} className="gap-1.5">
                Atrás
              </Button>
              <Button type="button" size="lg" onClick={() => handleActiveTabChange("health")} className="gap-1.5">
                Siguiente: Salud e Inclusión
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 3: SALUD E INCLUSIÓN */}
        {/* ========================================================================= */}
        <TabsContent value="health" className="space-y-6">
          <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
            <EnrollmentStepCardHeader
              icon={HeartHandshakeIcon}
              title="3. Salud e Inclusión"
              description="Información para garantizar la equidad, accesibilidad y ajustes razonables en tu formación."
            />
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <FieldLabel htmlFor="receivesReasonableAdjustments" className="text-sm font-medium">
                    ¿Requiere ajustes razonables o apoyos específicos?
                  </FieldLabel>
                  <FieldDescription>Ajustes pedagógicos, edilicios o de acompañamiento por razones de salud o discapacidad.</FieldDescription>
                </div>
                <Switch
                  id="receivesReasonableAdjustments"
                  size="lg"
                  checked={receivesReasonableAdjustments}
                  onCheckedChange={setReceivesReasonableAdjustments}
                />
              </div>

              {receivesReasonableAdjustments && (
                <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                    <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Documentación médica requerida</AlertTitle>
                    <AlertDescription>
                      Al solicitar ajustes razonables, deberás presentar el Certificado Único de Discapacidad (CUD) o informe médico pertinente en la
                      institución de forma física.
                    </AlertDescription>
                  </Alert>

                  <Field data-invalid={!!getFieldError(["healthInclusion", "adjustmentDetails"])}>
                    <FieldLabel htmlFor="adjustmentDetails" required>
                      Detalle de los apoyos requeridos
                    </FieldLabel>
                    <Textarea
                      id="adjustmentDetails"
                      value={adjustmentDetails}
                      onChange={(e) => setAdjustmentDetails(e.target.value)}
                      placeholder="Describí brevemente los apoyos que necesitás para tu cursada…"
                      rows={3}
                      aria-invalid={!!getFieldError(["healthInclusion", "adjustmentDetails"])}
                    />
                    <FieldError errors={[{ message: getFieldError(["healthInclusion", "adjustmentDetails"]) }]} />
                  </Field>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("education")} className="gap-1.5">
                Atrás
              </Button>
              <Button type="button" size="lg" onClick={() => handleActiveTabChange(isMinor ? "responsible" : "spaces")} className="gap-1.5">
                {isMinor ? "Siguiente: Tutor Legal" : "Siguiente: Cursos"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 4: RESPONSABLE / TUTOR LEGAL (Sólo para menores de edad) */}
        {/* ========================================================================= */}
        {isMinor && (
          <TabsContent value="responsible" className="space-y-6">
            <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
              <EnrollmentStepCardHeader
                icon={UsersRoundIcon}
                title="4. Responsable / Tutor Legal"
                description="Obligatorio: Al ser menor de 18 años, debés consignar los datos de tu tutor o representante legal."
                action={<Badge variant="destructive">Obligatorio (Menor)</Badge>}
              />
              <CardContent className="space-y-4">
                <Field data-invalid={!!getFieldError(["responsible", "fullName"])}>
                  <FieldLabel htmlFor="responsibleFullName" required={isMinor}>
                    Nombre y Apellido del Responsable
                  </FieldLabel>
                  <Input
                    id="responsibleFullName"
                    value={responsibleFullName}
                    onChange={(e) => setResponsibleFullName(e.target.value)}
                    placeholder="María Rodríguez"
                    autoComplete="name"
                    aria-invalid={!!getFieldError(["responsible", "fullName"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["responsible", "fullName"]) }]} />
                </Field>

                <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                  <Field data-invalid={!!getFieldError(["responsible", "documentNumber"])}>
                    <FieldLabel htmlFor="responsibleDocumentNumber" required={isMinor}>
                      DNI del Responsable
                    </FieldLabel>
                    <NumericInput
                      id="responsibleDocumentNumber"
                      maxLength={8}
                      value={responsibleDocumentNumber}
                      onChange={(e) => setResponsibleDocumentNumber(e.target.value)}
                      placeholder="20123456"
                      aria-invalid={!!getFieldError(["responsible", "documentNumber"])}
                    />
                    <FieldError errors={[{ message: getFieldError(["responsible", "documentNumber"]) }]} />
                  </Field>

                  <Field data-invalid={!!getFieldError(["responsible", "phoneNumber"])}>
                    <FieldLabel htmlFor="responsiblePhoneNumber" required={isMinor}>
                      Teléfono del Responsable
                    </FieldLabel>
                    <PhoneInput
                      id="responsiblePhoneNumber"
                      value={responsiblePhoneNumber}
                      onChange={(e) => setResponsiblePhoneNumber(e.target.value)}
                      placeholder="3534987654"
                      autoComplete="tel"
                      aria-invalid={!!getFieldError(["responsible", "phoneNumber"])}
                    />
                    <FieldError errors={[{ message: getFieldError(["responsible", "phoneNumber"]) }]} />
                  </Field>
                </div>

                <div className="grid gap-4 @min-[48rem]:grid-cols-2">
                  <Field data-invalid={!!getFieldError(["responsible", "email"])}>
                    <FieldLabel htmlFor="responsibleEmail" required={isMinor}>
                      Correo electrónico
                    </FieldLabel>
                    <Input
                      id="responsibleEmail"
                      type="email"
                      value={responsibleEmail}
                      onChange={(e) => setResponsibleEmail(e.target.value)}
                      placeholder="tutor@ejemplo.com"
                      autoComplete="email"
                      spellCheck={false}
                      aria-invalid={!!getFieldError(["responsible", "email"])}
                    />
                    <FieldError errors={[{ message: getFieldError(["responsible", "email"]) }]} />
                  </Field>

                  <Field data-invalid={!!getFieldError(["responsible", "occupation"])}>
                    <FieldLabel htmlFor="responsibleOccupation" required={isMinor}>
                      Ocupación / Profesión
                    </FieldLabel>
                    <Input
                      id="responsibleOccupation"
                      value={responsibleOccupation}
                      onChange={(e) => setResponsibleOccupation(e.target.value)}
                      placeholder="Empleado / Docente / Comercio"
                      aria-invalid={!!getFieldError(["responsible", "occupation"])}
                    />
                    <FieldError errors={[{ message: getFieldError(["responsible", "occupation"]) }]} />
                  </Field>
                </div>

                <Field data-invalid={!!getFieldError(["responsible", "educationLevel"])}>
                  <FieldLabel htmlFor="responsibleEducationLevel" required={isMinor}>
                    Nivel de Instrucción
                  </FieldLabel>
                  <Select value={responsibleEducationLevel} onValueChange={setResponsibleEducationLevel}>
                    <SelectTrigger className="w-full" aria-invalid={!!getFieldError(["responsible", "educationLevel"])}>
                      <SelectValue placeholder="Seleccioná el máximo nivel alcanzado" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[{ message: getFieldError(["responsible", "educationLevel"]) }]} />
                </Field>
              </CardContent>
              <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("health")} className="gap-1.5">
                  Atrás
                </Button>
                <Button type="button" size="lg" onClick={() => handleActiveTabChange("spaces")} className="gap-1.5">
                  Siguiente: Cursos
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}

        {/* ========================================================================= */}
        {/* PASO 5/4: ESPACIOS CURRICULARES E INSTRUMENTOS */}
        {/* ========================================================================= */}
        <TabsContent value="spaces" className="space-y-6">
          <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
            <EnrollmentStepCardHeader
              icon={LibraryBigIcon}
              title={isMinor ? "5. Cursos" : "4. Cursos"}
              description="Seleccioná los cursos que querés solicitar. En los instrumentales, elegí el curso del instrumento que vas a estudiar."
            />
            <CardContent>
              {selectedCourseIds
                .filter((id) => !courseOptions.some((option) => option.courseId === id))
                .map((id) => {
                  const selected = initialApplication.courses?.find((course) => course.courseId === id);
                  const name = selected
                    ? `${selected.academicSpaceName}${selected.instrumentName ? ` · ${selected.instrumentName}` : ""}`
                    : "Curso seleccionado";
                  return (
                    <div key={id} className="mb-3 flex items-center justify-between gap-3 rounded-lg border p-3">
                      <span>{name}</span>
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
              {courseOptionsError ? <p className="text-destructive mt-3 text-sm">{courseOptionsError}</p> : null}
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
              <Button type="button" size="lg" onClick={() => handleActiveTabChange("preferences")} className="gap-1.5">
                Siguiente: Preferencias
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO: PREFERENCIAS */}
        {/* ========================================================================= */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-muted/25 @container sm:[--card-spacing:--spacing(6)]">
            <EnrollmentStepCardHeader
              icon={SlidersHorizontalIcon}
              title={isMinor ? "6. Preferencias y Consentimientos" : "5. Preferencias y Consentimientos"}
              description="Seleccioná tu turno preferido y manifestá tus autorizaciones institucionales."
            />
            <CardContent className="space-y-5">
              <Field data-invalid={!!getFieldError(["preference", "preferredShift"])}>
                <FieldLabel htmlFor="preferredShift" required>
                  Turno de preferencia
                </FieldLabel>
                <Select value={preferredShift} onValueChange={setPreferredShift}>
                  <SelectTrigger id="preferredShift" className="h-9! w-full" aria-invalid={!!getFieldError(["preference", "preferredShift"])}>
                    <SelectValue placeholder="Seleccioná un turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {shiftOptions.length > 0 ? (
                        shiftOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="px-2.5 py-1.5">
                            {option.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no-shifts" disabled>
                          No hay turnos disponibles
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError errors={[{ message: getFieldError(["preference", "preferredShift"]) }]} />
              </Field>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <FieldLabel htmlFor="allowsImageUse" className="text-sm font-medium">
                    Autorización para uso de imagen
                  </FieldLabel>
                  <FieldDescription>
                    Autorizo a la institución a registrar y publicar fotografías y videos con fines pedagógicos y difusión cultural.
                  </FieldDescription>
                </div>
                <Switch id="allowsImageUse" size="lg" checked={allowsImageUse} onCheckedChange={setAllowsImageUse} />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <FieldLabel htmlFor="isReenrolling" className="text-sm font-medium">
                    ¿Sos estudiante reingresante?
                  </FieldLabel>
                  <FieldDescription>Indicá si cursaste materias en este conservatorio o instituto en ciclos anteriores.</FieldDescription>
                </div>
                <Switch id="isReenrolling" size="lg" checked={isReenrolling} onCheckedChange={setIsReenrolling} />
              </div>

              {isReenrolling && (
                <Field data-invalid={!!getFieldError(["preference", "previousTeacher"])}>
                  <FieldLabel htmlFor="previousTeacher" required>
                    Docente con quien cursaste previamente
                  </FieldLabel>
                  <Input
                    id="previousTeacher"
                    value={previousTeacher}
                    onChange={(e) => setPreviousTeacher(e.target.value)}
                    placeholder="Profesor/a de instrumento o cátedra"
                    aria-invalid={!!getFieldError(["preference", "previousTeacher"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["preference", "previousTeacher"]) }]} />
                </Field>
              )}
            </CardContent>
            <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" size="lg" onClick={() => handleActiveTabChange("spaces")} className="gap-1.5">
                Atrás
              </Button>
              {!readOnly ? (
                <Button type="button" size="lg" onClick={() => setIsSubmitDialogOpen(true)} disabled={saving || isCancelDialogOpen}>
                  Enviar inscripción
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Cancel Application */}
      {isCancelDialogOpen && (
        <EnrollmentCancelDialog
          applicationId={application.applicationId}
          beforeCancel={() => draftSaveQueue.current}
          onClose={() => setIsCancelDialogOpen(false)}
          onCancelled={setApplication}
        />
      )}
      {isSubmitDialogOpen ? <EnrollmentSubmitDialog onClose={() => setIsSubmitDialogOpen(false)} onSubmit={submitApplication} /> : null}
    </div>
  );
}
