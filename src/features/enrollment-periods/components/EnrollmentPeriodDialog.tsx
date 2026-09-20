"use client";

import { ActionForm } from "@common/components/action-form";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { useActionState, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Input } from "@common/components/ui/input";
import { Label } from "@common/components/ui/label";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import { format, isValid } from "date-fns";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";

import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";

interface Props {
  institutionId: string;
  period: EnrollmentPeriod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope?: AcademicScopeType;
}

export function EnrollmentPeriodDialog({ institutionId, period, open, onOpenChange, scope = AcademicScope.INSTITUTIONAL }: Props) {
  const router = useRouter();
  const fetchAcademicYears = useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage<AcademicYear>("academic-years", scope, institutionId, input, { active: "all" }),
    [scope, institutionId],
  );

  const [name, setName] = useState(period?.name ?? "");
  const [academicYearId, setAcademicYearId] = useState(period?.academicYearId ?? "");
  const [startDate, setStartDate] = useState(period?.startDate ? format(new Date(period.startDate), "yyyy-MM-dd'T'HH:mm") : "");
  const [endDate, setEndDate] = useState(period?.endDate ? format(new Date(period.endDate), "yyyy-MM-dd'T'HH:mm") : "");

  const [state, formAction, loading] = useActionState(
    async (_previous: EnrollmentPeriodActionState, formData: FormData): Promise<EnrollmentPeriodActionState> => {
      const start = new Date(String(formData.get("startDate") ?? ""));
      const end = new Date(String(formData.get("endDate") ?? ""));

      if (!isValid(start) || !isValid(end)) {
        return { error: ENROLLMENT_MESSAGES.DATE_INPUT_INVALID };
      }

      const values = { name: String(formData.get("name") ?? ""), startDate: start.toISOString(), endDate: end.toISOString() };
      const result = period
        ? await updateEnrollmentPeriodAction(institutionId, period.id, values, scope)
        : await createEnrollmentPeriodAction(institutionId, { ...values, academicYearId: String(formData.get("academicYearId") ?? "") }, scope);

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      }

      return result;
    },
    {},
  );
  const error = state.error;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!loading) {
          onOpenChange(next);
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <ActionForm action={formAction}>
          <DialogHeader>
            <DialogTitle>{period ? "Editar Período de Inscripción" : "Nuevo Período de Inscripción"}</DialogTitle>
            <DialogDescription>Configurá las fechas de inicio y fin para habilitar las pre-inscripciones.</DialogDescription>
          </DialogHeader>

          {error && <div className="bg-destructive/15 text-destructive my-2 rounded p-3 text-sm font-medium">{error}</div>}

          <div className="grid gap-4 py-4">
            {!period && (
              <div className="grid gap-2">
                <Label htmlFor="academicYear">Ciclo Lectivo</Label>
                <input type="hidden" name="academicYearId" value={academicYearId} />
                <AsyncDropdown<AcademicYear>
                  id="academicYear"
                  value={academicYearId}
                  onValueChange={(value) => setAcademicYearId(value ?? "")}
                  fetchPage={fetchAcademicYears}
                  queryKey={["enrollment-period-academic-years", scope, institutionId]}
                  getItemValue={(year) => year.id}
                  getItemLabel={(year) => `Ciclo Lectivo ${year.year}`}
                  placeholder="Seleccioná un ciclo"
                  searchPlaceholder="Buscar ciclo lectivo…"
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Período</Label>
              <Input
                name="name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Inscripción 2026 - Primer Llamado"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha y Hora de Inicio</Label>
              <Input
                name="startDate"
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha y Hora de Fin</Label>
              <Input name="endDate" id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || (!period && !academicYearId)}>
              {loading ? "Guardando..." : period ? "Guardar Cambios" : "Crear Período"}
            </Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
