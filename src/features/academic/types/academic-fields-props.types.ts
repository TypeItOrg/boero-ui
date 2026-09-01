import type { ReactNode } from "react";

import type { AcademicFormOptions } from "@features/academic/types/academic-form-options.types";

export type AcademicFieldsProps = AcademicFormOptions & {
  fieldErrors?: Record<string, string>;
  institutionField?: ReactNode;
};
