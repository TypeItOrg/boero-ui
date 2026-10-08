"use client";

import { useActionState, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { format, isValid } from "date-fns";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import { EnrollmentPeriodDialogFields } from "@features/enrollment-periods/components/enrollment-period-dialog-fields";
import { EnrollmentPeriodOfferings } from "@features/enrollment-periods/components/enrollment-period-offerings";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

interface Props {
  institutionId: string;
  period: EnrollmentPeriod | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope?: AcademicScopeType;
}

export function EnrollmentPeriodDialog({ institutionId, period, open, onOpenChange, scope = AcademicScope.INSTITUTIONAL }: Props) {
  const router = useRouter();
  const [offerings, setOfferings] = useState<EnrollmentPeriodOffering[]>(period?.offerings ?? []);
  const fetchAcademicYears = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<AcademicYear>("academic-years", scope, institutionId, input, {
        active: "all",
        operation: period ? "ENROLLMENT_PERIOD_UPDATE" : "ENROLLMENT_PERIOD_CREATE",
      }),
    [scope, institutionId, period],
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

      const values = {
        offerings: offerings.map((offering) => ({
          studyPlanId: offering.studyPlanId,
          academicLevelIds: offering.academicLevels.map((level) => level.id),
          includeUnassigned: offering.includeUnassigned,
        })),
        name: String(formData.get("name") ?? ""),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <ActionForm action={formAction}>
          <DialogHeader>
            <DialogTitle>{period ? "Editar Período de Inscripción" : "Nuevo Período de Inscripción"}</DialogTitle>
            <DialogDescription>Configurá las fechas de inicio y fin para habilitar las pre-inscripciones.</DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <EnrollmentPeriodDialogFields
            period={period}
            academicYearId={academicYearId}
            setAcademicYearId={setAcademicYearId}
            fetchAcademicYears={fetchAcademicYears}
            scope={scope}
            institutionId={institutionId}
            loading={loading}
            name={name}
            setName={setName}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <EnrollmentPeriodOfferings
            operation={period ? "ENROLLMENT_PERIOD_UPDATE" : "ENROLLMENT_PERIOD_CREATE"}
            institutionId={institutionId}
            scope={scope}
            value={offerings}
            onChange={setOfferings}
            disabled={loading}
          />
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
