import type { Institution } from "@features/institutions/types/institution.types";

type InstitutionalInstitutionDetailProps = {
  institution: Institution;
};

export function InstitutionalInstitutionDetail({
  institution,
}: InstitutionalInstitutionDetailProps): React.ReactElement {
  const address = formatAddress(institution);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <h2 className="text-foreground font-semibold">Ubicación</h2>

        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <LocationDetail className="col-span-full" label="Dirección" value={address} />
          <LocationDetail label="País" value={institution.country.name} />
          <LocationDetail label="Provincia" value={institution.province.name} />
          <LocationDetail label="Ciudad" value={institution.city.name} />
        </div>
      </div>

      <div className="bg-muted/25 rounded-xl border p-4 sm:p-5">
        <h2 className="text-foreground font-semibold">Contacto</h2>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          <ContactDetail label="Teléfono" value={institution.phoneNumber} />
          <ContactDetail label="Correo electrónico" value={institution.email} />
        </div>
      </div>

      <div className="bg-muted/25 flex flex-1 flex-col rounded-xl border p-4 sm:p-5">
        <h2 className="text-foreground font-semibold">Información adicional</h2>
        <p className="text-foreground mt-5 flex-1 text-base leading-6 whitespace-pre-wrap">
          {institution.additionalInfo?.trim() || "Sin información adicional."}
        </p>
      </div>
    </div>
  );
}

interface LocationDetailProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

function LocationDetail({ label, value, ...props }: LocationDetailProps): React.ReactElement {
  return (
    <div {...props}>
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-1.5 text-base font-medium">{value}</p>
    </div>
  );
}

function ContactDetail({ label, value }: { label: string; value: string | null }): React.ReactElement {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-foreground mt-1.5 truncate text-base font-medium">{value?.trim() || "No informado"}</p>
    </div>
  );
}

function formatAddress(institution: Institution): string {
  const street = [institution.street, institution.number]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");

  return (
    [street, institution.neighborhood].filter((part): part is string => Boolean(part?.trim())).join(", ") ||
    "Dirección no informada"
  );
}
