"use client";

import type { ReactElement } from "react";

import type { FieldErrors } from "react-hook-form";

import { Button } from "@common/components/ui/button";

import { getSubmitLabel } from "@features/institutions/utils/institution-form.util";

export function InstitutionFormFooter({
  handleCancel,
  isPending,
  errors,
  isEdit,
}: {
  handleCancel: () => void;
  isPending: boolean;
  errors: FieldErrors<{
    name: string;
    slug: string;
    cityId: string;
    street: string;
    number: string;
    neighborhood: string;
    additionalInfo: string;
    phoneNumber: string;
    email: string;
  }>;
  isEdit: boolean;
}): ReactElement {
  return (
    <div className="border-border/40 flex flex-row flex-wrap items-center justify-end gap-3 border-t pt-5 pb-6">
      <Button type="button" variant="outline" size="lg" className="flex-1 sm:flex-none" onClick={handleCancel} disabled={isPending}>
        Cancelar
      </Button>
      <Button
        type="submit"
        size="lg"
        className="flex-1 sm:flex-none"
        disabled={isPending || errors.root?.logo?.type === "client"}
        aria-busy={isPending}
      >
        {getSubmitLabel({ isEdit, isPending })}
      </Button>
    </div>
  );
}
