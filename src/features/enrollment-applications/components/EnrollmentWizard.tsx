"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SendIcon,
  BanIcon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { Button } from "@common/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@common/components/ui/card";
import { Field, FieldLabel, FieldDescription, FieldError } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput, PhoneInput } from "@common/components/ui/restricted-input";
import { DatePicker } from "@common/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Switch } from "@common/components/ui/switch";
import { Textarea } from "@common/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@common/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import {
  startOrGetEnrollmentApplicationAction,
  updateEnrollmentDraftAction,
  submitEnrollmentApplicationAction,
  cancelEnrollmentApplicationAction,
  fetchEnrollmentApplicationTrainingPathsAction,
  fetchEnrollmentApplicationStudyPlanSpacesAction,
} from "../actions/enrollment-application.actions";
import { calculateAge, enrollmentApplicationSubmissionSchema } from "../schemas/enrollment-application.schema";
import { SHIFT_OPTIONS, EDUCATION_LEVEL_OPTIONS } from "../constants/enrollment-application.constants";
import { EnrollmentStatusCard } from "./EnrollmentStatusCard";
import { EnrollmentTrainingPathSelector } from "./EnrollmentTrainingPathSelector";
import { EnrollmentStudyPlanSpacesSelector } from "./EnrollmentStudyPlanSpacesSelector";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { EnrollmentApplicationData, EnrollmentApplicationResponse } from "../types/enrollment-application.types";
import type { z } from "zod";

interface EnrollmentWizardProps {
  studyPlanId: string;
  academicYearId: string;
  readOnly?: boolean;
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

export function EnrollmentWizard({ studyPlanId, academicYearId, readOnly = false }: EnrollmentWizardProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [application, setApplication] = React.useState<EnrollmentApplicationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>(() => {
    return searchParams.get("tab") || "personal";
  });

  // Status flags
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [validationIssues, setValidationIssues] = React.useState<z.ZodIssue[]>([]);
  const [pendingFocusFieldId, setPendingFocusFieldId] = React.useState<string | null>(null);

  // Flag to avoid auto-saving empty state before initial fetch
  const isInitialDataLoaded = React.useRef(false);

  // 1. Datos Personales
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [birthDate, setBirthDate] = React.useState<Date | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  // 2. Escolaridad de Base
  const [secondarySchool, setSecondarySchool] = React.useState("");
  const [currentGradeYear, setCurrentGradeYear] = React.useState("");
  const [secondaryCompleted, setSecondaryCompleted] = React.useState(false);
  const [secondaryDegreeTitle, setSecondaryDegreeTitle] = React.useState("");

  // 3. Salud e Inclusión
  const [receivesReasonableAdjustments, setReceivesReasonableAdjustments] = React.useState(false);
  const [adjustmentDetails, setAdjustmentDetails] = React.useState("");

  // 4. Responsable / Tutor Legal
  const [responsibleFullName, setResponsibleFullName] = React.useState("");
  const [responsibleDocumentNumber, setResponsibleDocumentNumber] = React.useState("");
  const [responsiblePhoneNumber, setResponsiblePhoneNumber] = React.useState("");
  const [responsibleEmail, setResponsibleEmail] = React.useState("");
  const [responsibleOccupation, setResponsibleOccupation] = React.useState("");
  const [responsibleEducationLevel, setResponsibleEducationLevel] = React.useState("");

  // 5. Trayecto Formativo
  const [trainingPaths, setTrainingPaths] = React.useState<TrainingPath[]>([]);
  const [selectedTrainingPathId, setSelectedTrainingPathId] = React.useState("");
  const [trainingPathsLoadError, setTrainingPathsLoadError] = React.useState(false);

  // 6. Espacios e Instrumentos
  const [studyPlanSpaces, setStudyPlanSpaces] = React.useState<StudyPlanSpace[]>([]);
  const [selectedStudyPlanSpaceIds, setSelectedStudyPlanSpaceIds] = React.useState<string[]>([]);
  const [selectedInstrumentIdsByStudyPlanSpaceId, setSelectedInstrumentIdsByStudyPlanSpaceId] = React.useState<Record<string, string>>({});
  const [loadingSpaces, setLoadingSpaces] = React.useState(false);
  const [studyPlanSpacesLoadError, setStudyPlanSpacesLoadError] = React.useState(false);

  // 7. Preferencias
  const [preferredShift, setPreferredShift] = React.useState("");
  const [allowsImageUse, setAllowsImageUse] = React.useState(false);
  const [isReenrolling, setIsReenrolling] = React.useState(false);
  const [previousTeacher, setPreviousTeacher] = React.useState("");

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
      { id: "training-path", label: "Trayecto Formativo" },
      { id: "spaces", label: "Espacios e Instrumentos" },
      { id: "preferences", label: "Preferencias" },
    ];
    return rawTabs.map((tab, index) => ({
      ...tab,
      label: `${index + 1}. ${tab.label}`,
    }));
  }, [isMinor]);

  const effectiveActiveTab = !isMinor && activeTab === "responsible" ? "training-path" : activeTab;

  // Sync activeTab with URL query params
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", activeTab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Initial fetch / start application
  React.useEffect(() => {
    let active = true;

    startOrGetEnrollmentApplicationAction({ studyPlanId, academicYearId })
      .then((data) => {
        if (!active) return;
        setApplication(data);

        const appData = data.data || {};
        const personal = appData.personalData || {};
        const academic = appData.academicBackground || {};
        const health = appData.healthInclusion || {};
        const resp = appData.responsible || {};
        const pref = appData.preference || {};

        setFirstName(personal.firstName || "");
        setLastName(personal.lastName || "");
        setDocumentNumber(personal.documentNumber || "");

        if (personal.birthDate) {
          const parsedDate = new Date(personal.birthDate + "T00:00:00");
          if (isValid(parsedDate)) {
            setBirthDate(parsedDate);
          }
        }

        setPhoneNumber(personal.phoneNumber || "");
        setEmail(personal.email || "");

        setSecondarySchool(academic.secondarySchool || "");
        setCurrentGradeYear(academic.currentGradeYear ? String(academic.currentGradeYear) : "");
        setSecondaryCompleted(Boolean(academic.secondaryCompleted));
        setSecondaryDegreeTitle(academic.secondaryDegreeTitle || "");

        setReceivesReasonableAdjustments(Boolean(health.receivesReasonableAdjustments));
        setAdjustmentDetails(health.adjustmentDetails || "");

        setResponsibleFullName(resp.fullName || "");
        setResponsibleDocumentNumber(resp.documentNumber || "");
        setResponsiblePhoneNumber(resp.phoneNumber || "");
        setResponsibleEmail(resp.email || "");
        setResponsibleOccupation(resp.occupation || "");
        setResponsibleEducationLevel(resp.educationLevel || "");

        setPreferredShift(pref.preferredShift || "");
        setAllowsImageUse(Boolean(pref.allowsImageUse));
        setIsReenrolling(Boolean(pref.isReenrolling));
        setPreviousTeacher(pref.previousTeacher || "");

        const career = appData.careerSelection || {};
        const spaceSel = appData.academicSpaceSelection || {};
        const instSel = appData.instrumentSelection || {};

        setSelectedTrainingPathId(career.trainingPathId || "");
        setSelectedStudyPlanSpaceIds(spaceSel.studyPlanSpaceIds || []);
        setSelectedInstrumentIdsByStudyPlanSpaceId(instSel.studyPlanSpaceInstrumentIds || {});

        // Fetch available training paths and study plan spaces
        fetchEnrollmentApplicationTrainingPathsAction(data.applicationId)
          .then((paths) => {
            if (!active) return;
            setTrainingPaths(paths);
            setTrainingPathsLoadError(false);
          })
          .catch(() => {
            if (!active) return;
            setTrainingPaths([]);
            setTrainingPathsLoadError(true);
          });

        fetchEnrollmentApplicationStudyPlanSpacesAction(data.applicationId)
          .then((spaces) => {
            if (!active) return;
            setStudyPlanSpaces(spaces);
            setStudyPlanSpacesLoadError(false);
          })
          .catch(() => {
            if (!active) return;
            setStudyPlanSpaces([]);
            setStudyPlanSpacesLoadError(true);
          });

        isInitialDataLoaded.current = true;
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "No se pudo iniciar la solicitud de inscripción.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studyPlanId, academicYearId]);

  // Focus the first invalid field once its tab has mounted after a failed
  // submission (the tab switch and this focus request commit together).
  React.useEffect(() => {
    if (!pendingFocusFieldId) return;
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

  const handleToggleSpace = (studyPlanSpaceId: string) => {
    setSelectedStudyPlanSpaceIds((prev) => {
      if (prev.includes(studyPlanSpaceId)) {
        const updated = prev.filter((id) => id !== studyPlanSpaceId);
        setSelectedInstrumentIdsByStudyPlanSpaceId((prevInst) => {
          const nextInst = { ...prevInst };
          delete nextInst[studyPlanSpaceId];
          return nextInst;
        });
        return updated;
      } else {
        return [...prev, studyPlanSpaceId];
      }
    });
  };

  const handleSelectInstrument = (studyPlanSpaceId: string, instrumentId: string) => {
    setSelectedInstrumentIdsByStudyPlanSpaceId((prev) => ({
      ...prev,
      [studyPlanSpaceId]: instrumentId,
    }));
  };

  // Structured payload for auto-save and submission
  const structuredData: EnrollmentApplicationData = React.useMemo(() => {
    return {
      personalData: {
        firstName,
        lastName,
        documentNumber,
        birthDate: birthDate && isValid(birthDate) ? format(birthDate, "yyyy-MM-dd") : "",
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
      academicSpaceSelection: selectedStudyPlanSpaceIds.length > 0 ? { studyPlanSpaceIds: selectedStudyPlanSpaceIds } : undefined,
      instrumentSelection:
        Object.keys(selectedInstrumentIdsByStudyPlanSpaceId).length > 0
          ? { studyPlanSpaceInstrumentIds: selectedInstrumentIdsByStudyPlanSpaceId }
          : undefined,
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
    selectedStudyPlanSpaceIds,
    selectedInstrumentIdsByStudyPlanSpaceId,
    preferredShift,
    allowsImageUse,
    isReenrolling,
    previousTeacher,
  ]);

  const debouncedData = useDebouncedValue(structuredData, 800);

  // Auto-save logic
  React.useEffect(() => {
    const appId = application?.applicationId;
    const appStatus = application?.status;
    if (!appId || loading || !isInitialDataLoaded.current) return;
    if (appStatus !== "DRAFT") return;

    let active = true;

    async function autoSave() {
      await Promise.resolve();
      if (!active || !appId) return;
      setSaving(true);
      setSaveError(null);

      try {
        const updated = await updateEnrollmentDraftAction(appId, { data: debouncedData });
        if (active) {
          setApplication((prev) => (prev ? { ...prev, updatedAt: updated.updatedAt } : updated));
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : "Error al guardar el borrador";
          setSaveError(msg);
        }
      } finally {
        if (active) {
          setSaving(false);
        }
      }
    }

    autoSave();

    return () => {
      active = false;
    };
  }, [debouncedData, application?.applicationId, application?.status, loading]);

  // Refetch spaces when selected training path changes; a genuine career
  // change (not the initial hydration from a persisted draft) invalidates
  // whatever spaces/instruments were picked for the previous plan, mirroring
  // the backend's reassign-and-clear rule for updateDraft.
  const previousTrainingPathIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const appId = application?.applicationId;
    if (!appId || !selectedTrainingPathId || !isInitialDataLoaded.current) return;

    const isCareerChange = previousTrainingPathIdRef.current !== null && previousTrainingPathIdRef.current !== selectedTrainingPathId;
    previousTrainingPathIdRef.current = selectedTrainingPathId;

    if (isCareerChange) {
      setSelectedStudyPlanSpaceIds([]);
      setSelectedInstrumentIdsByStudyPlanSpaceId({});
    }

    let active = true;
    setLoadingSpaces(true);
    fetchEnrollmentApplicationStudyPlanSpacesAction(appId)
      .then((updatedSpaces) => {
        if (!active) return;
        setStudyPlanSpaces(updatedSpaces);
        setStudyPlanSpacesLoadError(false);
      })
      .catch(() => {
        if (!active) return;
        setStudyPlanSpacesLoadError(true);
      })
      .finally(() => {
        if (!active) return;
        setLoadingSpaces(false);
      });
    return () => {
      active = false;
    };
  }, [selectedTrainingPathId, application?.applicationId]);

  // Submission handler with full Zod validation and conditional rules
  const handleSubmitApplication = async () => {
    if (!application?.applicationId || isSubmitting) return;

    setSubmissionError(null);
    setValidationIssues([]);
    setIsSubmitting(true);

    // The catalog fetches failing is not the same as an empty catalog: an
    // empty list means the step is genuinely optional, a failed fetch means
    // we don't actually know, so we can't silently skip the required checks
    // below.
    if (trainingPathsLoadError) {
      setIsSubmitting(false);
      setSubmissionError("No se pudieron cargar los trayectos formativos disponibles. Reintentá antes de enviar la inscripción.");
      setActiveTab("training-path");
      return;
    }

    if (studyPlanSpacesLoadError) {
      setIsSubmitting(false);
      setSubmissionError("No se pudieron cargar los espacios académicos disponibles. Reintentá antes de enviar la inscripción.");
      setActiveTab("spaces");
      return;
    }

    const parseResult = enrollmentApplicationSubmissionSchema.safeParse(structuredData);

    if (!parseResult.success) {
      setIsSubmitting(false);
      const issues = parseResult.error.issues;
      setValidationIssues(issues);

      // Auto-navigate to the first invalid step and focus its field
      const firstIssue = issues[0];
      if (firstIssue && firstIssue.path.length > 0) {
        const section = firstIssue.path[0];
        if (section === "personalData") setActiveTab("personal");
        else if (section === "academicBackground") setActiveTab("education");
        else if (section === "healthInclusion") setActiveTab("health");
        else if (section === "responsible" && isMinor) setActiveTab("responsible");
        else if (section === "careerSelection") setActiveTab("training-path");
        else if (section === "academicSpaceSelection" || section === "instrumentSelection") setActiveTab("spaces");
        else if (section === "preference") setActiveTab("preferences");

        const fieldId = FIELD_ID_BY_ERROR_PATH[firstIssue.path.join(".")];
        if (fieldId) setPendingFocusFieldId(fieldId);
      }
      return;
    }

    if (trainingPaths.length > 0 && !selectedTrainingPathId) {
      setIsSubmitting(false);
      setSubmissionError("Debés seleccionar un trayecto formativo antes de enviar.");
      setActiveTab("training-path");
      return;
    }

    if (studyPlanSpaces.length > 0 && selectedStudyPlanSpaceIds.length === 0) {
      setIsSubmitting(false);
      setSubmissionError("Debés seleccionar al menos un espacio curricular.");
      setActiveTab("spaces");
      return;
    }

    const missingInstrumentSpace = studyPlanSpaces.find(
      (s) => selectedStudyPlanSpaceIds.includes(s.id) && s.requiresInstrument && !selectedInstrumentIdsByStudyPlanSpaceId[s.id],
    );
    if (missingInstrumentSpace) {
      setIsSubmitting(false);
      setSubmissionError(`Debés seleccionar un instrumento para "${missingInstrumentSpace.academicSpaceName}".`);
      setActiveTab("spaces");
      return;
    }

    try {
      // 1. Guardar último estado del borrador
      await updateEnrollmentDraftAction(application.applicationId, { data: structuredData });
      // 2. Enviar solicitud formal
      const submitted = await submitEnrollmentApplicationAction(application.applicationId);
      setApplication(submitted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar la postulación";
      setSubmissionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancellation handler
  const handleCancelApplication = async () => {
    if (!application?.applicationId || isCancelling) return;

    setIsCancelling(true);
    setSubmissionError(null);

    try {
      const cancelled = await cancelEnrollmentApplicationAction(application.applicationId);
      setApplication(cancelled);
      setIsCancelDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cancelar la postulación";
      setSubmissionError(msg);
      setIsCancelDialogOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  // Helpers to query validation errors by path
  const getFieldError = (path: (string | number)[]): string | undefined => {
    const issue = validationIssues.find((iss) => {
      if (iss.path.length !== path.length) return false;
      return iss.path.every((val, idx) => val === path[idx]);
    });
    return issue?.message;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  // Error state on initialization
  if (error || !application) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Inscripción no disponible</AlertTitle>
        <AlertDescription>{error || "No se pudo cargar la solicitud de inscripción."}</AlertDescription>
      </Alert>
    );
  }

  // If application is no longer in draft (SUBMITTED, APPROVED, REJECTED, CANCELLED), render read-only status view
  if (application.status !== "DRAFT") {
    return <EnrollmentStatusCard application={application} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {readOnly && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangleIcon className="text-amber-600 size-4" />
          <AlertTitle className="text-amber-900">Solicitud de inscripción - Visualización</AlertTitle>
          <AlertDescription className="text-amber-800">
            Esta solicitud ya ha sido enviada y no se puede modificar. Los datos que ves a continuación son solo de referencia.
          </AlertDescription>
        </Alert>
      )}

      {/* Wizard Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Formulario de Inscripción</h1>
          <p className="text-muted-foreground text-sm">Completá cada uno de los pasos para solicitar tu admisión en el instituto.</p>
        </div>

        <div className="flex items-center gap-4">
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

          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCancelDialogOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30 text-xs"
            >
              <BanIcon className="mr-1 size-3.5" />
              Cancelar borrador
            </Button>
          )}
        </div>
      </div>

      {/* General Submission / Validation Errors Banner */}
      {submissionError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>No se pudo enviar la inscripción</AlertTitle>
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}

      {validationIssues.length > 0 && (
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
          <AlertTriangleIcon className="size-4" />
          <AlertTitle>Campos obligatorios incompletos ({validationIssues.length})</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              {validationIssues.map((issue, idx) => (
                <li key={idx}>{issue.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs navigation */}
      <Tabs value={effectiveActiveTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid h-auto w-full gap-1 p-1 ${
            isMinor ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
          }`}
        >
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="py-2.5 text-xs font-medium data-[state=active]:font-semibold">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ========================================================================= */}
        {/* PASO 1: DATOS PERSONALES Y CONTACTO */}
        {/* ========================================================================= */}
        <TabsContent value="personal" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Datos Personales y Contacto</CardTitle>
              <CardDescription>Información identificatoria y canales de contacto del postulante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "firstName"])}>
                  <FieldLabel htmlFor="firstName" required>
                    Nombre
                  </FieldLabel>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Pérez"
                    autoComplete="family-name"
                    aria-invalid={!!getFieldError(["personalData", "lastName"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "lastName"]) }]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "documentNumber"])}>
                  <FieldLabel htmlFor="documentNumber" required>
                    Documento Nacional de Identidad (DNI)
                  </FieldLabel>
                  <NumericInput
                    id="documentNumber"
                    maxLength={8}
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="12345678"
                    aria-invalid={!!getFieldError(["personalData", "documentNumber"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "documentNumber"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "birthDate"])}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="birthDate" required>
                      Fecha de nacimiento
                    </FieldLabel>
                    {calculatedAge !== null && (
                      <Badge variant={isMinor ? "destructive" : "outline"} className="text-xs">
                        {calculatedAge} años {isMinor ? "(Menor de 18)" : "(Mayor de edad)"}
                      </Badge>
                    )}
                  </div>
                  <DatePicker
                    id="birthDate"
                    value={birthDate}
                    onChange={(d) => setBirthDate(d)}
                    maxDate={new Date()}
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "phoneNumber"])}>
                  <FieldLabel htmlFor="phoneNumber" required>
                    Teléfono de contacto
                  </FieldLabel>
                  <PhoneInput
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="postulante@ejemplo.com"
                    autoComplete="email"
                    spellCheck={false}
                    aria-invalid={!!getFieldError(["personalData", "email"])}
                  />
                  <FieldError errors={[{ message: getFieldError(["personalData", "email"]) }]} />
                </Field>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="button" onClick={() => setActiveTab("education")} className="gap-1.5">
                Siguiente: Escolaridad
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 2: ESCOLARIDAD DE BASE */}
        {/* ========================================================================= */}
        <TabsContent value="education" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>2. Escolaridad de Base</CardTitle>
              <CardDescription>Antecedentes de escolaridad y nivel de egreso secundario.</CardDescription>
            </CardHeader>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="currentGradeYear">Año cursado o egreso</FieldLabel>
                  <NumericInput
                    id="currentGradeYear"
                    maxLength={4}
                    value={currentGradeYear}
                    onChange={(e) => setCurrentGradeYear(e.target.value)}
                    placeholder="2024"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="secondaryDegreeTitle">Título o especialidad obtenida</FieldLabel>
                  <Input
                    id="secondaryDegreeTitle"
                    value={secondaryDegreeTitle}
                    onChange={(e) => setSecondaryDegreeTitle(e.target.value)}
                    placeholder="Bachiller en Arte y Música"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="secondaryCompleted" className="text-sm font-medium">
                    ¿Secundario completo?
                  </FieldLabel>
                  <FieldDescription>Indicá si ya finalizaste todos los estudios secundarios y tenés título o constancia de egreso.</FieldDescription>
                </div>
                <Switch id="secondaryCompleted" checked={secondaryCompleted} onCheckedChange={setSecondaryCompleted} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("personal")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab("health")} className="gap-1.5">
                Siguiente: Salud e Inclusión
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 3: SALUD E INCLUSIÓN */}
        {/* ========================================================================= */}
        <TabsContent value="health" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>3. Salud e Inclusión</CardTitle>
              <CardDescription>Información para garantizar la equidad, accesibilidad y ajustes razonables en tu formación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="receivesReasonableAdjustments" className="text-sm font-medium">
                    ¿Requiere ajustes razonables o apoyos específicos?
                  </FieldLabel>
                  <FieldDescription>Ajustes pedagógicos, edilicios o de acompañamiento por razones de salud o discapacidad.</FieldDescription>
                </div>
                <Switch
                  id="receivesReasonableAdjustments"
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
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("education")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab(isMinor ? "responsible" : "training-path")} className="gap-1.5">
                {isMinor ? "Siguiente: Tutor Legal" : "Siguiente: Trayecto Formativo"}
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 4: RESPONSABLE / TUTOR LEGAL (Sólo para menores de edad) */}
        {/* ========================================================================= */}
        {isMinor && (
          <TabsContent value="responsible" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>4. Responsable / Tutor Legal</CardTitle>
                    <CardDescription>
                      {isMinor
                        ? "Obligatorio: Al ser menor de 18 años, debés consignar los datos de tu tutor o representante legal."
                        : "Opcional: Al ser mayor de edad, podés omitir esta sección o ingresar un contacto alternativo."}
                    </CardDescription>
                  </div>
                  <Badge variant={isMinor ? "destructive" : "outline"}>{isMinor ? "Obligatorio (Menor)" : "Opcional (Mayor)"}</Badge>
                </div>
              </CardHeader>
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

                <div className="grid gap-4 sm:grid-cols-2">
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

                <div className="grid gap-4 sm:grid-cols-2">
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
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("health")} className="gap-1.5">
                  <ChevronLeftIcon className="size-4" />
                  Atrás
                </Button>
                <Button type="button" onClick={() => setActiveTab("training-path")} className="gap-1.5">
                  Siguiente: Trayecto Formativo
                  <ChevronRightIcon className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}

        {/* ========================================================================= */}
        {/* PASO: TRAYECTO FORMATIVO */}
        {/* ========================================================================= */}
        <TabsContent value="training-path" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isMinor ? "5. Trayecto Formativo" : "4. Trayecto Formativo"}</CardTitle>
              <CardDescription>Elegí la orientación o especialidad dentro del plan de estudio.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentTrainingPathSelector
                trainingPaths={trainingPaths}
                selectedTrainingPathId={selectedTrainingPathId}
                onSelectTrainingPath={setSelectedTrainingPathId}
                disabled={!application.isEditable}
                error={getFieldError(["careerSelection", "trainingPathId"])}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab(isMinor ? "responsible" : "health")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab("spaces")} className="gap-1.5">
                Siguiente: Espacios e Instrumentos
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 6: ESPACIOS CURRICULARES E INSTRUMENTOS */}
        {/* ========================================================================= */}
        <TabsContent value="spaces" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isMinor ? "6. Espacios Académicos e Instrumentos" : "5. Espacios Académicos e Instrumentos"}</CardTitle>
              <CardDescription>Seleccioná las materias que vas a cursar y el instrumento que corresponda.</CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentStudyPlanSpacesSelector
                studyPlanSpaces={studyPlanSpaces}
                selectedStudyPlanSpaceIds={selectedStudyPlanSpaceIds}
                selectedInstrumentIdsByStudyPlanSpaceId={selectedInstrumentIdsByStudyPlanSpaceId}
                onToggleSpace={handleToggleSpace}
                onSelectInstrument={handleSelectInstrument}
                disabled={!application.isEditable}
                isLoading={loadingSpaces}
                spaceError={getFieldError(["academicSpaceSelection", "studyPlanSpaceIds"])}
                instrumentError={getFieldError(["instrumentSelection", "studyPlanSpaceInstrumentIds"])}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("training-path")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab("preferences")} className="gap-1.5">
                Siguiente: Preferencias
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO: PREFERENCIAS */}
        {/* ========================================================================= */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isMinor ? "7. Preferencias y Consentimientos" : "6. Preferencias y Consentimientos"}</CardTitle>
              <CardDescription>Seleccioná tu turno preferido y manifestá tus autorizaciones institucionales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field data-invalid={!!getFieldError(["preference", "preferredShift"])}>
                <FieldLabel htmlFor="preferredShift" required>
                  Turno de preferencia
                </FieldLabel>
                <Select value={preferredShift} onValueChange={setPreferredShift}>
                  <SelectTrigger className="w-full" aria-invalid={!!getFieldError(["preference", "preferredShift"])}>
                    <SelectValue placeholder="Seleccioná un turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[{ message: getFieldError(["preference", "preferredShift"]) }]} />
              </Field>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="allowsImageUse" className="text-sm font-medium">
                    Autorización para uso de imagen
                  </FieldLabel>
                  <FieldDescription>
                    Autorizo a la institución a registrar y publicar fotografías y videos con fines pedagógicos y difusión cultural.
                  </FieldDescription>
                </div>
                <Switch id="allowsImageUse" checked={allowsImageUse} onCheckedChange={setAllowsImageUse} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="isReenrolling" className="text-sm font-medium">
                    ¿Sos estudiante reingresante?
                  </FieldLabel>
                  <FieldDescription>Indicá si cursaste materias en este conservatorio o instituto en ciclos anteriores.</FieldDescription>
                </div>
                <Switch id="isReenrolling" checked={isReenrolling} onCheckedChange={setIsReenrolling} />
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
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("spaces")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
            </CardFooter>
          </Card>

          {!readOnly && (
            <div className="bg-muted/30 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">¿Listo para finalizar tu inscripción?</p>
                <p className="text-muted-foreground text-xs">
                  Al enviar la postulación, no podrás realizar más modificaciones mientras sea evaluada por el instituto.
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting || saving}
                  className="bg-primary gap-2 font-medium"
                >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    <span>Validando y enviando…</span>
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4" />
                    <span>Enviar inscripción</span>
                  </>
                )}
              </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Cancel Application */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseás cancelar tu borrador de inscripción?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción dará de baja tu postulación actual y ya no podrás seguir editándola. Si deseás postularte más adelante, deberás iniciar una
              nueva solicitud.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Conservar borrador</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleCancelApplication} disabled={isCancelling}>
              {isCancelling ? "Cancelando…" : "Sí, cancelar solicitud"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
