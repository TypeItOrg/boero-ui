"use client";

import { useActionState, useId } from "react";
import { GlobeIcon } from "lucide-react";
import { ActionForm } from "@common/components/action-form";
import { Button } from "@common/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { SectionHeader } from "@common/components/section-header";
import { updateInstitutionPublicAccess } from "@features/institutions/actions/update-institution-public-access.action";
import { InstitutionBrandingFeedback } from "@features/institutions/components/institution-branding-feedback";

export function InstitutionPublicAccessForm({
  institutionId,
  publicSubdomain,
  baseDomain,
}: {
  institutionId: string;
  publicSubdomain: string | null;
  baseDomain: string;
}): React.ReactElement {
  const id = useId();
  const [state, action, pending] = useActionState(updateInstitutionPublicAccess.bind(null, institutionId), {});
  return (
    <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader
          icon={GlobeIcon}
          title="Acceso público institucional"
          description="Nombre independiente del slug, administrado por la plataforma."
        />
      </header>
      <ActionForm action={action} className="mt-5 space-y-4">
        <Field data-invalid={Boolean(state.fieldErrors?.publicSubdomain)}>
          <FieldLabel htmlFor={id}>Nombre público</FieldLabel>
          <Input
            id={id}
            name="publicSubdomain"
            defaultValue={publicSubdomain ?? ""}
            maxLength={63}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.publicSubdomain)}
          />
          <FieldDescription>
            {baseDomain
              ? `Dirección: nombre.${baseDomain}. Dejalo vacío para deshabilitar el acceso institucional.`
              : "El acceso por dominio está deshabilitado en este ambiente. Podés preparar el nombre público; dejalo vacío para quitarlo."}
          </FieldDescription>
          <FieldError>{state.fieldErrors?.publicSubdomain}</FieldError>
        </Field>
        <InstitutionBrandingFeedback error={state.error} success={state.success} successMessage="Acceso público guardado." />
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? "Guardando…" : "Guardar acceso público"}
        </Button>
      </ActionForm>
    </section>
  );
}
