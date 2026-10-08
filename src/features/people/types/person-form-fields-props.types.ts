import { type FieldErrors, type UseFormRegister } from "react-hook-form";

import type { PersonFormInput } from "@features/people/types/person-form-input.types";

export type PersonFormFieldsProps = {
  errors: FieldErrors<PersonFormInput>;
  register: UseFormRegister<PersonFormInput>;
};
