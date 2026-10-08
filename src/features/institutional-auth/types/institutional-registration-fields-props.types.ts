import type { Dispatch, SetStateAction } from "react";

import { type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";

export type InstitutionalRegistrationFieldsProps = {
  state: InstitutionalRegisterActionState;
  institution: InstitutionalInstitution | undefined;
  setInstitution: Dispatch<SetStateAction<InstitutionalInstitution | undefined>>;
  isPending: boolean;
  birthDate: Date | undefined;
  setBirthDate: Dispatch<SetStateAction<Date | undefined>>;
};
