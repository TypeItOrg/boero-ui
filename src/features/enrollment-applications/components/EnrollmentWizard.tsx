"use client";

import * as React from "react";
import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Field, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@common/components/ui/tabs";
import { useDebouncedValue } from "@common/hooks/use-debounced-value";
import { startOrGetEnrollmentApplicationAction, updateEnrollmentDraftAction } from "../actions/enrollment-application.actions";
import type { EnrollmentApplicationResponse } from "../types/enrollment-application.types";

interface EnrollmentWizardProps {
  studyPlanId: string;
  academicYearId: string;
}

export function EnrollmentWizard({ studyPlanId, academicYearId }: EnrollmentWizardProps): React.ReactElement {
  const [application, setApplication] = React.useState<EnrollmentApplicationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("personal");
  const [saving, setSaving] = React.useState(false);

  // Form states matching structural sections
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [documentNumber, setDocumentNumber] = React.useState("");
  const [secondarySchool, setSecondarySchool] = React.useState("");

  // Initial fetch/creation
  React.useEffect(() => {
    startOrGetEnrollmentApplicationAction({ studyPlanId, academicYearId })
      .then((data) => {
        setApplication(data);
        const appData = data.data || {};
        const personal = (appData.personalData as Record<string, string>) || {};
        const academic = (appData.academicBackground as Record<string, string>) || {};
        setFirstName(personal.firstName || "");
        setLastName(personal.lastName || "");
        setDocumentNumber(personal.documentNumber || "");
        setSecondarySchool(academic.secondarySchool || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "No se pudo iniciar la solicitud de inscripción.");
        setLoading(false);
      });
  }, [studyPlanId, academicYearId]);

  // Track full structured data state for debounce autoguardado
  const structuredData = React.useMemo(() => {
    return {
      personalData: {
        firstName,
        lastName,
        documentNumber,
      },
      academicBackground: {
        secondarySchool,
      },
    };
  }, [firstName, lastName, documentNumber, secondarySchool]);

  const debouncedData = useDebouncedValue(structuredData, 1000);

  // Auto-save on structured data change
  React.useEffect(() => {
    if (!application?.applicationId || loading) return;

    let active = true;

    async function autoSave() {
      // Evitamos el setState en el hilo sincrónico de ejecución del Effect
      // haciendo que la llamada de actualización inicie en un microtask
      await Promise.resolve();
      if (!active) return;
      setSaving(true);
      try {
        const updated = await updateEnrollmentDraftAction(application!.applicationId, { data: debouncedData });
        if (active) {
          setApplication(updated);
        }
      } catch (err) {
        console.error("Auto-save error:", err);
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
  }, [debouncedData, application?.applicationId, loading]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2Icon className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon className="size-4" />
        <AlertTitle>Inscripción cerrada o no disponible</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Solicitud de Inscripción</h2>
          <p className="text-muted-foreground text-sm">Completá los campos obligatorios para postularte.</p>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          {saving ? (
            <>
              <Loader2Icon className="text-primary size-4 animate-spin" />
              <span>Guardando borrador...</span>
            </>
          ) : (
            <>
              <CheckCircle2Icon className="size-4 text-green-500" />
              <span>Borrador guardado</span>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">Datos Personales</TabsTrigger>
          <TabsTrigger value="academic">Antecedentes Académicos</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="firstName" required>
                Nombre
              </FieldLabel>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Juan" />
            </Field>

            <Field>
              <FieldLabel htmlFor="lastName" required>
                Apellido
              </FieldLabel>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Pérez" />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="documentNumber" required>
              Documento Nacional de Identidad (DNI)
            </FieldLabel>
            <Input id="documentNumber" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="12345678" />
          </Field>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setActiveTab("academic")} size="lg">
              Siguiente paso
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="mt-4 space-y-4">
          <Field>
            <FieldLabel htmlFor="secondarySchool" required>
              Escuela de nivel secundario de egreso
            </FieldLabel>
            <Input
              id="secondarySchool"
              value={secondarySchool}
              onChange={(e) => setSecondarySchool(e.target.value)}
              placeholder="Colegio Nacional General San Martín"
            />
          </Field>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setActiveTab("personal")} size="lg">
              Atrás
            </Button>
            <Button disabled size="lg">
              Enviar inscripción (Próximamente)
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
