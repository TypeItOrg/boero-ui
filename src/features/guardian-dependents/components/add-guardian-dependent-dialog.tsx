"use client";

import { startTransition, useActionState, useState, type SyntheticEvent } from "react";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { DatePicker } from "@common/components/ui/date-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { NumericInput } from "@common/components/ui/restricted-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { createGuardianDependentAction } from "@features/guardian-dependents/actions/create-guardian-dependent.action";
import { GUARDIAN_DEPENDENT_MESSAGES, GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependentActionState } from "@features/guardian-dependents/types/guardian-dependent-action-state.types";
import type { GuardianDependentFieldName } from "@features/guardian-dependents/types/guardian-dependent-field-name.types";
import { GUARDIAN_RELATIONSHIP } from "@features/guardian-dependents/types/guardian-relationship.types";
import { formatBirthDateInput, getEarliestMinorBirthDate, getLatestAllowedBirthDate } from "@features/people/utils/person-birth-date.util";

type AddGuardianDependentDialogProps = { institutionId: string; onClose: () => void; onSuccess: () => void };

const RELATIONSHIP_OPTIONS = Object.values(GUARDIAN_RELATIONSHIP);

export function AddGuardianDependentDialog({ institutionId, onClose, onSuccess }: AddGuardianDependentDialogProps): React.ReactElement {
  const [state, action, isPending] = useActionState<GuardianDependentActionState, FormData>(async (previous, formData) => {
    try {
      const result = await createGuardianDependentAction(institutionId, previous, formData);

      if (result.success) {
        onSuccess();
      }

      return result;
    } catch {
      return { error: GUARDIAN_DEPENDENT_MESSAGES.CREATE };
    }
  }, {});
  const [birthDate, setBirthDate] = useState<Date>();
  const [relationship, setRelationship] = useState("");
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isPending) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(() => action(formData));
  }

  function getErrors(field: GuardianDependentFieldName): { message: string }[] | undefined {
    const message = state.fieldErrors?.[field];

    return message ? [{ message }] : undefined;
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar persona a cargo</DialogTitle>
          <DialogDescription>Registrá a un menor a tu cargo para poder gestionar sus inscripciones.</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          {state.error ? (
            <Alert variant="destructive">
              <AlertCircleIcon className="size-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!state.fieldErrors?.firstName}>
              <FieldLabel htmlFor="dependent-first-name" required>
                Nombre
              </FieldLabel>
              <Input aria-invalid={!!state.fieldErrors?.firstName} disabled={isPending} id="dependent-first-name" name="firstName" />
              <FieldError errors={getErrors("firstName")} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.lastName}>
              <FieldLabel htmlFor="dependent-last-name" required>
                Apellido
              </FieldLabel>
              <Input aria-invalid={!!state.fieldErrors?.lastName} disabled={isPending} id="dependent-last-name" name="lastName" />
              <FieldError errors={getErrors("lastName")} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!state.fieldErrors?.documentNumber}>
              <FieldLabel htmlFor="dependent-document-number" required>
                Documento
              </FieldLabel>
              <NumericInput
                aria-invalid={!!state.fieldErrors?.documentNumber}
                disabled={isPending}
                id="dependent-document-number"
                maxLength={8}
                name="documentNumber"
              />
              <FieldError errors={getErrors("documentNumber")} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.birthDate}>
              <FieldLabel htmlFor="dependent-birth-date" required>
                Fecha de nacimiento
              </FieldLabel>
              <input name="birthDate" type="hidden" value={formatBirthDateInput(birthDate)} />
              <DatePicker
                aria-invalid={!!state.fieldErrors?.birthDate}
                disabled={isPending}
                id="dependent-birth-date"
                maxDate={getLatestAllowedBirthDate()}
                minDate={getEarliestMinorBirthDate()}
                onChange={setBirthDate}
                value={birthDate}
              />
              <FieldError errors={getErrors("birthDate")} />
            </Field>
          </div>

          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.relationship}>
              <FieldLabel htmlFor="dependent-relationship" required>
                Vínculo
              </FieldLabel>
              <input name="relationship" type="hidden" value={relationship} />
              <Select disabled={isPending} onValueChange={setRelationship} value={relationship}>
                <SelectTrigger aria-invalid={!!state.fieldErrors?.relationship} className="w-full" id="dependent-relationship">
                  <SelectValue placeholder="Seleccioná el vínculo" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {GUARDIAN_RELATIONSHIP_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={getErrors("relationship")} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.isPrimaryContact} orientation="horizontal">
              <input name="isPrimaryContact" type="hidden" value={String(isPrimaryContact)} />
              <Checkbox
                checked={isPrimaryContact}
                disabled={isPending}
                id="dependent-primary-contact"
                onCheckedChange={(checked) => setIsPrimaryContact(checked === true)}
              />
              <FieldLabel htmlFor="dependent-primary-contact">Contacto principal</FieldLabel>
              <FieldError errors={getErrors("isPrimaryContact")} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button disabled={isPending} onClick={onClose} type="button" variant="outline">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Agregando…" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
