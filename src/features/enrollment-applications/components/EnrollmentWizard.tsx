"use client";

import * as React from "react";
import {
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
  AlertTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  SendIcon,
  BanIcon,
  SparklesIcon,
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
} from "../actions/enrollment-application.actions";
import { calculateAge, enrollmentApplicationSubmissionSchema } from "../schemas/enrollment-application.schema";
import { SHIFT_OPTIONS, EDUCATION_LEVEL_OPTIONS } from "../constants/enrollment-application.constants";
import { DocumentUploaderCard } from "./DocumentUploaderCard";
import { EnrollmentStatusCard } from "./EnrollmentStatusCard";
import type {
  EnrollmentApplicationData,
  EnrollmentApplicationResponse,
  EnrollmentAttachment,
  EnrollmentDocumentType,
} from "../types/enrollment-application.types";
import type { z } from "zod";

interface EnrollmentWizardProps {
  studyPlanId: string;
  academicYearId: string;
}

const TABS = [
  { id: "personal", label: "1. Datos Personales" },
  { id: "education", label: "2. Escolaridad" },
  { id: "health", label: "3. Salud e Inclusión" },
  { id: "responsible", label: "4. Tutor Legal" },
  { id: "preferences", label: "5. Preferencias" },
  { id: "documents", label: "6. Adjuntos" },
] as const;

export function EnrollmentWizard({ studyPlanId, academicYearId }: EnrollmentWizardProps): React.ReactElement {
  const [application, setApplication] = React.useState<EnrollmentApplicationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("personal");

  // Status flags
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [validationIssues, setValidationIssues] = React.useState<z.ZodIssue[]>([]);

  // Flag to avoid auto-saving empty state before initial fetch
  const isInitialDataLoaded = React.useRef(false);

  // 1. Datos Personales
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [birthDate, setBirthDate] = React.useState<Date | undefined>(undefined);
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");

  // 2. Escolaridad de Base
  const [secondarySchool, setSecondarySchool] = React.useState("");
  const [graduationYear, setGraduationYear] = React.useState("");
  const [isSecondaryComplete, setIsSecondaryComplete] = React.useState(false);
  const [secondaryTitle, setSecondaryTitle] = React.useState("");

  // 3. Salud e Inclusión
  const [requiresSupport, setRequiresSupport] = React.useState(false);
  const [supportDetails, setSupportDetails] = React.useState("");

  // 4. Responsable / Tutor Legal
  const [responsibleFullName, setResponsibleFullName] = React.useState("");
  const [responsibleDocumentNumber, setResponsibleDocumentNumber] = React.useState("");
  const [responsiblePhone, setResponsiblePhone] = React.useState("");
  const [responsibleEmail, setResponsibleEmail] = React.useState("");
  const [responsibleOccupation, setResponsibleOccupation] = React.useState("");
  const [responsibleEducationLevel, setResponsibleEducationLevel] = React.useState("");

  // 5. Preferencias
  const [preferredShift, setPreferredShift] = React.useState("");
  const [imageAuthorization, setImageAuthorization] = React.useState(false);
  const [isReentering, setIsReentering] = React.useState(false);
  const [previousTeacher, setPreviousTeacher] = React.useState("");

  // 6. Documentación Adjunta
  const [attachments, setAttachments] = React.useState<EnrollmentAttachment[]>([]);

  // Reactive age computation
  const calculatedAge = React.useMemo(() => {
    return calculateAge(birthDate);
  }, [birthDate]);

  const isMinor = calculatedAge !== null && calculatedAge < 18;

  // Initial fetch / start application
  React.useEffect(() => {
    let active = true;

    startOrGetEnrollmentApplicationAction({ studyPlanId, academicYearId })
      .then((data) => {
        if (!active) return;
        setApplication(data);

        const appData = data.data || {};
        const personal = appData.personalData || {};
        const education = appData.educationBackground || {};
        const academic = appData.academicBackground || {};
        const health = appData.healthInclusion || {};
        const resp = appData.responsible || {};
        const pref = appData.preferences || {};
        const atts = appData.attachments || [];

        setFirstName(personal.firstName || "");
        setLastName(personal.lastName || "");
        setDocumentNumber(personal.documentNumber || "");

        if (personal.birthDate) {
          const parsedDate = new Date(personal.birthDate + "T00:00:00");
          if (isValid(parsedDate)) {
            setBirthDate(parsedDate);
          }
        }

        setAddress(personal.address || "");
        setCity(personal.city || "");
        setPhone(personal.phone || "");
        setEmail(personal.email || "");

        setSecondarySchool(education.secondarySchool || academic.secondarySchool || "");
        setGraduationYear(education.graduationYear ? String(education.graduationYear) : "");
        setIsSecondaryComplete(Boolean(education.isSecondaryComplete));
        setSecondaryTitle(education.secondaryTitle || "");

        setRequiresSupport(Boolean(health.requiresSupport));
        setSupportDetails(health.supportDetails || "");

        setResponsibleFullName(resp.fullName || "");
        setResponsibleDocumentNumber(resp.documentNumber || "");
        setResponsiblePhone(resp.phone || "");
        setResponsibleEmail(resp.email || "");
        setResponsibleOccupation(resp.occupation || "");
        setResponsibleEducationLevel(resp.educationLevel || "");

        setPreferredShift(pref.preferredShift || "");
        setImageAuthorization(Boolean(pref.imageAuthorization));
        setIsReentering(Boolean(pref.isReentering));
        setPreviousTeacher(pref.previousTeacher || "");

        setAttachments(atts);

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

  // Structured payload for auto-save and submission
  const structuredData: EnrollmentApplicationData = React.useMemo(() => {
    return {
      personalData: {
        firstName,
        lastName,
        documentNumber,
        birthDate: birthDate && isValid(birthDate) ? format(birthDate, "yyyy-MM-dd") : "",
        address,
        city,
        phone,
        email,
      },
      educationBackground: {
        secondarySchool,
        graduationYear,
        isSecondaryComplete,
        secondaryTitle,
      },
      academicBackground: {
        secondarySchool,
      },
      healthInclusion: {
        requiresSupport,
        supportDetails,
      },
      responsible: {
        fullName: responsibleFullName,
        documentNumber: responsibleDocumentNumber,
        phone: responsiblePhone,
        email: responsibleEmail,
        occupation: responsibleOccupation,
        educationLevel: responsibleEducationLevel,
      },
      preferences: {
        preferredShift,
        imageAuthorization,
        isReentering,
        previousTeacher,
      },
      attachments,
    };
  }, [
    firstName,
    lastName,
    documentNumber,
    birthDate,
    address,
    city,
    phone,
    email,
    secondarySchool,
    graduationYear,
    isSecondaryComplete,
    secondaryTitle,
    requiresSupport,
    supportDetails,
    responsibleFullName,
    responsibleDocumentNumber,
    responsiblePhone,
    responsibleEmail,
    responsibleOccupation,
    responsibleEducationLevel,
    preferredShift,
    imageAuthorization,
    isReentering,
    previousTeacher,
    attachments,
  ]);

  const debouncedData = useDebouncedValue(structuredData, 800);

  // Auto-save logic
  React.useEffect(() => {
    if (!application?.applicationId || loading || !isInitialDataLoaded.current) return;
    if (application.status !== "DRAFT") return;

    let active = true;

    async function autoSave() {
      await Promise.resolve();
      if (!active) return;
      setSaving(true);
      setSaveError(null);

      try {
        const updated = await updateEnrollmentDraftAction(application!.applicationId, { data: debouncedData });
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

  // Submission handler with full Zod validation and conditional rules
  const handleSubmitApplication = async () => {
    if (!application?.applicationId || isSubmitting) return;

    setSubmissionError(null);
    setValidationIssues([]);
    setIsSubmitting(true);

    const parseResult = enrollmentApplicationSubmissionSchema.safeParse(structuredData);

    if (!parseResult.success) {
      setIsSubmitting(false);
      const issues = parseResult.error.issues;
      setValidationIssues(issues);

      // Auto-navigate to the first invalid step
      const firstIssue = issues[0];
      if (firstIssue && firstIssue.path.length > 0) {
        const section = firstIssue.path[0];
        if (section === "personalData") setActiveTab("personal");
        else if (section === "educationBackground") setActiveTab("education");
        else if (section === "healthInclusion") setActiveTab("health");
        else if (section === "responsible") setActiveTab("responsible");
        else if (section === "preferences") setActiveTab("preferences");
        else if (section === "attachments") setActiveTab("documents");
      }
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

  // Document upload callbacks
  const handleUploadSuccess = (uploaded: EnrollmentAttachment) => {
    setAttachments((prev) => {
      const filtered = prev.filter((att) => att.documentType !== uploaded.documentType);
      return [...filtered, uploaded];
    });
  };

  const handleDeleteSuccess = (docType: EnrollmentDocumentType, attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId && att.documentType !== docType));
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
      {/* Wizard Header */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Formulario de Inscripción</h1>
          <p className="text-muted-foreground text-sm">Completá cada uno de los pasos para solicitar tu admisión en el instituto.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
            {saving ? (
              <>
                <Loader2Icon className="text-primary size-4 animate-spin" />
                <span>Guardando cambios...</span>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-3 lg:grid-cols-6">
          {TABS.map((tab) => (
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
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" />
                  <FieldError errors={[{ message: getFieldError(["personalData", "firstName"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "lastName"])}>
                  <FieldLabel htmlFor="lastName" required>
                    Apellido
                  </FieldLabel>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Pérez" />
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
                  <DatePicker id="birthDate" value={birthDate} onChange={(d) => setBirthDate(d)} maxDate={new Date()} />
                  {isMinor && (
                    <FieldDescription className="text-xs text-amber-600 dark:text-amber-400">
                      Al ser menor de 18 años, deberás completar los datos del tutor en el paso 4.
                    </FieldDescription>
                  )}
                  <FieldError errors={[{ message: getFieldError(["personalData", "birthDate"]) }]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "address"])}>
                  <FieldLabel htmlFor="address" required>
                    Domicilio (Calle y número)
                  </FieldLabel>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Libertador 1234" />
                  <FieldError errors={[{ message: getFieldError(["personalData", "address"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "city"])}>
                  <FieldLabel htmlFor="city" required>
                    Localidad
                  </FieldLabel>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Villa María" />
                  <FieldError errors={[{ message: getFieldError(["personalData", "city"]) }]} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field data-invalid={!!getFieldError(["personalData", "phone"])}>
                  <FieldLabel htmlFor="phone" required>
                    Teléfono de contacto
                  </FieldLabel>
                  <PhoneInput id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3534123456" />
                  <FieldError errors={[{ message: getFieldError(["personalData", "phone"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["personalData", "email"])}>
                  <FieldLabel htmlFor="email" required>
                    Correo electrónico
                  </FieldLabel>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="postulante@ejemplo.com" />
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
              <Field data-invalid={!!getFieldError(["educationBackground", "secondarySchool"])}>
                <FieldLabel htmlFor="secondarySchool" required>
                  Colegio secundario de origen
                </FieldLabel>
                <Input
                  id="secondarySchool"
                  value={secondarySchool}
                  onChange={(e) => setSecondarySchool(e.target.value)}
                  placeholder="Escuela Normal Superior Víctor Mercante"
                />
                <FieldError errors={[{ message: getFieldError(["educationBackground", "secondarySchool"]) }]} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="graduationYear">Año cursado o egreso</FieldLabel>
                  <NumericInput
                    id="graduationYear"
                    maxLength={4}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="2024"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="secondaryTitle">Título o especialidad obtenida</FieldLabel>
                  <Input
                    id="secondaryTitle"
                    value={secondaryTitle}
                    onChange={(e) => setSecondaryTitle(e.target.value)}
                    placeholder="Bachiller en Arte y Música"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="isSecondaryComplete" className="text-sm font-medium">
                    ¿Secundario completo?
                  </FieldLabel>
                  <FieldDescription>Indicá si ya finalizaste todos los estudios secundarios y tenés título o constancia de egreso.</FieldDescription>
                </div>
                <Switch id="isSecondaryComplete" checked={isSecondaryComplete} onCheckedChange={setIsSecondaryComplete} />
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
                  <FieldLabel htmlFor="requiresSupport" className="text-sm font-medium">
                    ¿Requiere ajustes razonables o apoyos específicos?
                  </FieldLabel>
                  <FieldDescription>Ajustes pedagógicos, edilicios o de acompañamiento por razones de salud o discapacidad.</FieldDescription>
                </div>
                <Switch id="requiresSupport" checked={requiresSupport} onCheckedChange={setRequiresSupport} />
              </div>

              {requiresSupport && (
                <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                    <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle>Documentación médica requerida</AlertTitle>
                    <AlertDescription>
                      Al solicitar ajustes razonables, deberás adjuntar el Certificado Único de Discapacidad (CUD) o informe médico pertinente en el
                      paso 6 (Adjuntos).
                    </AlertDescription>
                  </Alert>

                  <Field data-invalid={!!getFieldError(["healthInclusion", "supportDetails"])}>
                    <FieldLabel htmlFor="supportDetails" required>
                      Detalle de los apoyos requeridos
                    </FieldLabel>
                    <Textarea
                      id="supportDetails"
                      value={supportDetails}
                      onChange={(e) => setSupportDetails(e.target.value)}
                      placeholder="Describí brevemente los apoyos que necesitás para tu cursada..."
                      rows={3}
                    />
                    <FieldError errors={[{ message: getFieldError(["healthInclusion", "supportDetails"]) }]} />
                  </Field>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("education")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab("responsible")} className="gap-1.5">
                Siguiente: Tutor Legal
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 4: RESPONSABLE / TUTOR LEGAL */}
        {/* ========================================================================= */}
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
                  />
                  <FieldError errors={[{ message: getFieldError(["responsible", "documentNumber"]) }]} />
                </Field>

                <Field data-invalid={!!getFieldError(["responsible", "phone"])}>
                  <FieldLabel htmlFor="responsiblePhone" required={isMinor}>
                    Teléfono del Responsable
                  </FieldLabel>
                  <PhoneInput
                    id="responsiblePhone"
                    value={responsiblePhone}
                    onChange={(e) => setResponsiblePhone(e.target.value)}
                    placeholder="3534987654"
                  />
                  <FieldError errors={[{ message: getFieldError(["responsible", "phone"]) }]} />
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
                  />
                  <FieldError errors={[{ message: getFieldError(["responsible", "occupation"]) }]} />
                </Field>
              </div>

              <Field data-invalid={!!getFieldError(["responsible", "educationLevel"])}>
                <FieldLabel htmlFor="responsibleEducationLevel" required={isMinor}>
                  Nivel de Instrucción
                </FieldLabel>
                <Select value={responsibleEducationLevel} onValueChange={setResponsibleEducationLevel}>
                  <SelectTrigger className="w-full">
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
              <Button type="button" onClick={() => setActiveTab("preferences")} className="gap-1.5">
                Siguiente: Preferencias
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 5: PREFERENCIAS */}
        {/* ========================================================================= */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>5. Preferencias y Consentimientos</CardTitle>
              <CardDescription>Seleccioná tu turno preferido y manifestá tus autorizaciones institucionales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Field data-invalid={!!getFieldError(["preferences", "preferredShift"])}>
                <FieldLabel htmlFor="preferredShift" required>
                  Turno de preferencia
                </FieldLabel>
                <Select value={preferredShift} onValueChange={setPreferredShift}>
                  <SelectTrigger className="w-full">
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
                <FieldError errors={[{ message: getFieldError(["preferences", "preferredShift"]) }]} />
              </Field>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="imageAuthorization" className="text-sm font-medium">
                    Autorización para uso de imagen
                  </FieldLabel>
                  <FieldDescription>
                    Autorizo a la institución a registrar y publicar fotografías y videos con fines pedagógicos y difusión cultural.
                  </FieldDescription>
                </div>
                <Switch id="imageAuthorization" checked={imageAuthorization} onCheckedChange={setImageAuthorization} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FieldLabel htmlFor="isReentering" className="text-sm font-medium">
                    ¿Sos estudiante reingresante?
                  </FieldLabel>
                  <FieldDescription>Indicá si cursaste materias en este conservatorio o instituto en ciclos anteriores.</FieldDescription>
                </div>
                <Switch id="isReentering" checked={isReentering} onCheckedChange={setIsReentering} />
              </div>

              {isReentering && (
                <Field data-invalid={!!getFieldError(["preferences", "previousTeacher"])}>
                  <FieldLabel htmlFor="previousTeacher" required>
                    Docente con quien cursaste previamente
                  </FieldLabel>
                  <Input
                    id="previousTeacher"
                    value={previousTeacher}
                    onChange={(e) => setPreviousTeacher(e.target.value)}
                    placeholder="Profesor/a de instrumento o cátedra"
                  />
                  <FieldError errors={[{ message: getFieldError(["preferences", "previousTeacher"]) }]} />
                </Field>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("responsible")} className="gap-1.5">
                <ChevronLeftIcon className="size-4" />
                Atrás
              </Button>
              <Button type="button" onClick={() => setActiveTab("documents")} className="gap-1.5">
                Siguiente: Documentación
                <ChevronRightIcon className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* PASO 6: DOCUMENTACIÓN ADJUNTA */}
        {/* ========================================================================= */}
        <TabsContent value="documents" className="mt-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">6. Documentación Requerida</h2>
            <p className="text-muted-foreground text-sm">Adjuntá las imágenes o archivos PDF solicitados para completar la postulación.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* 1. DNI Frente */}
            <DocumentUploaderCard
              applicationId={application.applicationId}
              documentType="DNI_FRONT"
              title="DNI (Frente)"
              description="Foto legible de la parte frontal del DNI donde se vean tus datos."
              required
              attachment={attachments.find((a) => a.documentType === "DNI_FRONT")}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />

            {/* 2. DNI Dorso */}
            <DocumentUploaderCard
              applicationId={application.applicationId}
              documentType="DNI_BACK"
              title="DNI (Dorso)"
              description="Foto legible del dorso del DNI con domicilio visible."
              required
              attachment={attachments.find((a) => a.documentType === "DNI_BACK")}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />

            {/* 3. Foto 4x4 */}
            <DocumentUploaderCard
              applicationId={application.applicationId}
              documentType="PHOTO_4X4"
              title="Foto Carnet 4x4"
              description="Foto carnet actualizada sobre fondo blanco o liso para el legajo."
              required
              attachment={attachments.find((a) => a.documentType === "PHOTO_4X4")}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />

            {/* 4. Título Secundario */}
            <DocumentUploaderCard
              applicationId={application.applicationId}
              documentType="SECONDARY_CERTIFICATE"
              title="Título Secundario o Constancia"
              description="Copia del analítico final o certificado de título en trámite."
              required={isSecondaryComplete}
              attachment={attachments.find((a) => a.documentType === "SECONDARY_CERTIFICATE")}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />

            {/* 5. Informe de Salud (Condicional si requiere apoyo) */}
            <DocumentUploaderCard
              applicationId={application.applicationId}
              documentType="HEALTH_REPORT"
              title="Informe de Salud / Certificado CUD"
              description="Certificado médico o CUD para respaldar los apoyos solicitados."
              required={requiresSupport}
              attachment={attachments.find((a) => a.documentType === "HEALTH_REPORT")}
              onUploadSuccess={handleUploadSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>

          <div className="bg-muted/30 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">¿Listo para finalizar tu inscripción?</p>
              <p className="text-muted-foreground text-xs">
                Al enviar la postulación, no podrás realizar más modificaciones mientras sea evaluada por el instituto.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <Button type="button" variant="outline" onClick={() => setActiveTab("preferences")}>
                <ChevronLeftIcon className="mr-1 size-4" />
                Atrás
              </Button>

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
                    <span>Validando y enviando...</span>
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
              {isCancelling ? "Cancelando..." : "Sí, cancelar solicitud"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
