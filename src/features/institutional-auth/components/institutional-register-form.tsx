"use client";

import { useActionState, useState, type ReactElement } from "react";

import { ActionForm } from "@common/components/action-form";

import { registerInstitutional } from "@features/institutional-auth/actions/institutional-register.action";
import { type InstitutionalInstitution } from "@features/institutional-auth/components/institution-picker";
import { InstitutionalAuthStepHeader } from "@features/institutional-auth/components/institutional-auth-step-header";
import { InstitutionalRegistrationFields } from "@features/institutional-auth/components/institutional-registration-fields";
import type { InstitutionalRegisterActionState } from "@features/institutional-auth/types/institutional-register-state.types";

const INITIAL_STATE: InstitutionalRegisterActionState = {};

export function InstitutionalRegisterForm(): ReactElement {
  const [state, formAction, isPending] = useActionState<InstitutionalRegisterActionState, FormData>(registerInstitutional, INITIAL_STATE);

  const [institution, setInstitution] = useState<InstitutionalInstitution>();

  const [birthDate, setBirthDate] = useState<Date>();

  return (
    <ActionForm action={formAction} className="flex flex-col justify-center p-5 sm:p-8">
      <InstitutionalAuthStepHeader
        title="Formá parte"
        description="Completá tus datos para registrarte en una institución."
        showInstitutionName={false}
      />

      <InstitutionalRegistrationFields
        state={state}
        institution={institution}
        setInstitution={setInstitution}
        isPending={isPending}
        birthDate={birthDate}
        setBirthDate={setBirthDate}
      />
    </ActionForm>
  );
}
