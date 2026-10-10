import type { ReactElement } from "react";

import { NumericInput } from "@common/components/ui/restricted-input";
import { toFormControlValue } from "@common/utils/form-value.util";

import { DescriptionField, FormField } from "@features/academic/components/academic-form-controls";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";

export function AcademicLevelFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): ReactElement {
  return (
    <>
      <FormField label="Orden" name="displayOrder" error={fieldErrors?.displayOrder} className="w-full flex-none" required>
        <NumericInput
          aria-invalid={Boolean(fieldErrors?.displayOrder)}
          defaultValue={toFormControlValue(initialValues.displayOrder ?? 1)}
          id="displayOrder"
          name="displayOrder"
          required
        />
      </FormField>
      <p className="text-muted-foreground w-full flex-[1_0_100%] text-sm">
        El nombre se genera automáticamente a partir del orden (Nivel 1, Nivel 2, …).
      </p>
      <DescriptionField initialValues={initialValues} error={fieldErrors?.description} />
    </>
  );
}
