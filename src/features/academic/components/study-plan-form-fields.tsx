import { NumericInput } from "@common/components/ui/restricted-input";
import { useCallback, useState } from "react";
import { XIcon } from "lucide-react";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { Instrument } from "@features/academic/types/instrument.types";
import { toFormControlValue, toOptionalFormString } from "@common/utils/form-value.util";
import { DateRangeFields } from "@features/academic/components/academic-date-range-fields";
import { DescriptionField, FormField, FormSelect, NameField } from "@features/academic/components/academic-form-controls";
import { AcademicSpaceDropdown, TrainingPathDropdown } from "@features/academic/components/academic-option-dropdown";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { APPROVAL_MODE } from "@features/academic/types/approval-mode.types";
import { REQUIRED_CONDITION } from "@features/academic/types/required-condition.types";
import { REQUIREMENT_STAGE } from "@features/academic/types/requirement-stage.types";
import { REQUIREMENT_TYPE } from "@features/academic/types/requirement-type.types";
import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";
import {
  academicSpaceFormatLabels,
  academicSpaceTypeLabels,
  approvalModeLabels,
  requiredConditionLabels,
  requirementStageLabels,
  requirementTypeLabels,
  studyPlanStatusLabels,
} from "@features/academic/utils/academic-labels.util";

const STUDY_PLAN_STATUS_OPTIONS = STUDY_PLAN_STATUS.filter((status) => status !== "INACTIVE").map((status) => ({
  value: status,
  label: studyPlanStatusLabels[status],
}));

export function StudyPlanFields({
  canChangeStatus = false,
  initialValues = {},
  fieldErrors,
  institutionId,
  scope,
  trainingPathLocked = false,
  trainingPaths = [],
}: AcademicFieldsProps): React.ReactElement {
  const initialTrainingPathId = toOptionalFormString(initialValues.trainingPathId);
  const initialStatus = toOptionalFormString(initialValues.status);

  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} />
      {canChangeStatus && initialStatus ? (
        <FormField label="Estado" name="status" error={fieldErrors?.status} className="sm:col-span-2" required>
          <FormSelect name="status" defaultValue={initialStatus} options={STUDY_PLAN_STATUS_OPTIONS} />
        </FormField>
      ) : null}
      <FormField label="Trayecto formativo" name="trainingPathId" error={fieldErrors?.trainingPathId} className="sm:col-span-2" required>
        {institutionId && scope ? (
          <TrainingPathDropdown
            key={institutionId}
            ariaInvalid={Boolean(fieldErrors?.trainingPathId)}
            disabled={trainingPathLocked}
            institutionId={institutionId}
            initialValue={initialTrainingPathId}
            name="trainingPathId"
            scope={scope}
            selectedLabel={toOptionalFormString(initialValues.trainingPathName)}
          />
        ) : (
          <FormSelect
            disabled={Boolean(scope)}
            name="trainingPathId"
            defaultValue={initialTrainingPathId ?? ""}
            placeholder={scope ? "Seleccioná una institución primero" : "Seleccionar trayecto"}
            options={trainingPaths.map((path) => ({ value: path.id, label: path.name }))}
          />
        )}
      </FormField>
      <DateRangeFields
        startLabel="Vigente desde"
        startName="effectiveFrom"
        endLabel="Vigente hasta"
        endName="effectiveTo"
        initialValues={initialValues}
        fieldErrors={fieldErrors}
      />
    </>
  );
}

export function AcademicLevelFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  return (
    <>
      <NameField initialValues={initialValues} error={fieldErrors?.name} fullWidth={false} />
      <FormField label="Orden" name="displayOrder" error={fieldErrors?.displayOrder} className="w-full flex-none sm:max-w-48" required>
        <NumericInput
          aria-invalid={Boolean(fieldErrors?.displayOrder)}
          defaultValue={toFormControlValue(initialValues.displayOrder ?? 1)}
          id="displayOrder"
          name="displayOrder"
          required
        />
      </FormField>
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}

export function StudyPlanSpaceFields({
  academicSpaces = [],
  initialInstruments = [],
  institutionId,
  levels = [],
  initialValues = {},
  fieldErrors,
  scope,
}: AcademicFieldsProps): React.ReactElement {
  const initialAcademicSpaceId = toOptionalFormString(initialValues.academicSpaceId);
  const [instruments, setInstruments] = useState(initialInstruments);
  const fetchInstruments = useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage<Instrument>("instruments", scope!, institutionId!, input),
    [scope, institutionId],
  );

  return (
    <>
      <FormField label="Espacio académico" name="academicSpaceId" error={fieldErrors?.academicSpaceId} className="sm:col-span-2" required>
        {institutionId && scope ? (
          <AcademicSpaceDropdown
            ariaInvalid={Boolean(fieldErrors?.academicSpaceId)}
            institutionId={institutionId}
            initialValue={initialAcademicSpaceId}
            name="academicSpaceId"
            scope={scope}
            selectedLabel={toOptionalFormString(initialValues.academicSpaceName)}
          />
        ) : (
          <FormSelect
            name="academicSpaceId"
            defaultValue={initialAcademicSpaceId ?? ""}
            placeholder="Seleccionar espacio"
            options={academicSpaces.map((space) => ({
              value: space.id,
              label: `${space.name} · ${academicSpaceTypeLabels[space.type]} · ${academicSpaceFormatLabels[space.format]}`,
            }))}
          />
        )}
      </FormField>
      <FormField label="Nivel" name="academicLevelId" error={fieldErrors?.academicLevelId}>
        <FormSelect
          name="academicLevelId"
          defaultValue={toFormControlValue(initialValues.academicLevelId) || "unassigned"}
          options={[{ value: "unassigned", label: "Sin nivel" }, ...levels.map((level) => ({ value: level.id, label: level.name }))]}
        />
      </FormField>
      <FormField label="Orden" name="displayOrder" error={fieldErrors?.displayOrder} required>
        <NumericInput
          aria-invalid={Boolean(fieldErrors?.displayOrder)}
          defaultValue={toFormControlValue(initialValues.displayOrder ?? 1)}
          id="displayOrder"
          name="displayOrder"
          required
        />
      </FormField>
      <FormField label="Carácter" name="requirementType" error={fieldErrors?.requirementType} required>
        <FormSelect
          name="requirementType"
          defaultValue={toFormControlValue(initialValues.requirementType ?? REQUIREMENT_TYPE[0])}
          options={REQUIREMENT_TYPE.map((type) => ({ value: type, label: requirementTypeLabels[type] }))}
        />
      </FormField>
      <FormField label="Aprobación" name="approvalMode" error={fieldErrors?.approvalMode} required>
        <FormSelect
          name="approvalMode"
          defaultValue={toFormControlValue(initialValues.approvalMode ?? APPROVAL_MODE[0])}
          options={APPROVAL_MODE.map((mode) => ({ value: mode, label: approvalModeLabels[mode] }))}
        />
      </FormField>
      <FormField label="Instrumentos permitidos" name="instrumentIds" error={fieldErrors?.instrumentIds} className="sm:col-span-2">
        <AsyncDropdown<Instrument>
          id="instrumentIds"
          disabled={!institutionId || !scope}
          ariaInvalid={Boolean(fieldErrors?.instrumentIds)}
          fetchPage={fetchInstruments}
          queryKey={["academic-options", "instruments", scope, institutionId]}
          getItemLabel={(item) => item.name}
          getItemValue={(item) => item.id}
          selectedValues={instruments.map((item) => item.instrumentId)}
          placeholder="Agregar instrumento"
          searchPlaceholder="Buscar instrumento..."
          emptyMessage="No se encontraron instrumentos activos."
          errorMessage="No se pudieron cargar los instrumentos."
          onValueChange={(_value, item) => {
            if (!item) {
              return;
            }

            setInstruments((previous) =>
              previous.some((selected) => selected.instrumentId === item.id)
                ? previous.filter((selected) => selected.instrumentId !== item.id)
                : [...previous, { instrumentId: item.id, name: item.name }],
            );
          }}
        />
        <div className="flex flex-wrap gap-2">
          {instruments.map((instrument) => (
            <span key={instrument.instrumentId} className="bg-muted inline-flex items-center gap-1 rounded-md pl-2 text-sm">
              <input type="hidden" name="instrumentIds" value={instrument.instrumentId} />
              {instrument.name}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar ${instrument.name}`}
                onClick={() => setInstruments((previous) => previous.filter((item) => item.instrumentId !== instrument.instrumentId))}
              >
                <XIcon className="size-3.5" />
              </Button>
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">Si agregás opciones, el aspirante deberá elegir uno de estos instrumentos al inscribirse.</p>
      </FormField>
    </>
  );
}

export function PrerequisiteFields({
  excludedPlanSpaceId,
  initialValues = {},
  fieldErrors,
  planSpaces = [],
}: AcademicFieldsProps): React.ReactElement {
  const options = planSpaces
    .filter((space) => space.id !== excludedPlanSpaceId)
    .map((space) => ({
      value: space.id,
      label: [space.academicLevelName, space.academicSpaceName].filter(Boolean).join(" · "),
    }));
  const hasAvailableSpaces = options.length > 0;

  return (
    <>
      <FormField
        label="Espacio requerido"
        name="requiredStudyPlanSpaceId"
        error={fieldErrors?.requiredStudyPlanSpaceId}
        className="sm:col-span-2"
        required
      >
        <FormSelect
          name="requiredStudyPlanSpaceId"
          defaultValue={toFormControlValue(initialValues.requiredStudyPlanSpaceId)}
          disabled={!hasAvailableSpaces}
          placeholder={hasAvailableSpaces ? "Seleccionar espacio" : "No hay otros espacios disponibles"}
          options={options}
        />
      </FormField>
      <FormField label="Momento" name="requirementStage" error={fieldErrors?.requirementStage} required>
        <FormSelect
          name="requirementStage"
          defaultValue={toFormControlValue(initialValues.requirementStage ?? REQUIREMENT_STAGE[0])}
          options={REQUIREMENT_STAGE.map((stage) => ({ value: stage, label: requirementStageLabels[stage] }))}
        />
      </FormField>
      <FormField label="Condición" name="requiredCondition" error={fieldErrors?.requiredCondition} required>
        <FormSelect
          name="requiredCondition"
          defaultValue={toFormControlValue(initialValues.requiredCondition ?? REQUIRED_CONDITION[1])}
          options={REQUIRED_CONDITION.map((condition) => ({
            value: condition,
            label: requiredConditionLabels[condition],
          }))}
        />
      </FormField>
    </>
  );
}
