"use client";

import { useId, type ReactElement } from "react";

import { GlobeIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Field, FieldDescription, FieldError, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";

export function InstitutionPublicAccessField({
  value,
  onChange,
  baseDomain,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  baseDomain: string;
  error?: string;
}): ReactElement {
  const id = useId();

  return (
    <section className="bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-5">
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader icon={GlobeIcon} title="Acceso público institucional" description="Subdominio para ingresar al portal de la institución." />
      </header>
      <Field className="mt-5" data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={id}>Subdominio</FieldLabel>
        <div className="bg-background focus-within:ring-ring/50 flex min-w-0 items-center overflow-hidden rounded-lg border focus-within:ring-2">
          <Input
            id={id}
            name="publicSubdomain"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={63}
            className="min-w-0 border-0 bg-transparent shadow-none focus-visible:ring-0"
            aria-describedby={`${id}-description${error ? ` ${id}-error` : ""}`}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(error)}
          />
          {baseDomain ? (
            <span className="text-muted-foreground bg-muted/40 hidden shrink-0 border-l px-3 py-2 text-sm sm:block">.{baseDomain}</span>
          ) : null}
        </div>
        <FieldDescription id={`${id}-description`}>Identifica a la institución en su dirección de acceso.</FieldDescription>
        <FieldError id={`${id}-error`}>{error}</FieldError>
      </Field>
    </section>
  );
}
