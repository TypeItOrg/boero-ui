import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { PersonSummary } from "@features/people/types/person-summary.types";

type TeachersTableRowProps = {
  teacher: PersonSummary;
};

export function TeachersTableRow({ teacher }: TeachersTableRowProps): React.ReactElement {
  return (
    <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
      <TableCell className="font-medium">
        <ReturnToLink href={`/teachers/${teacher.id}`}>
          <span className="hover:underline">
            {teacher.lastName}, {teacher.firstName}
          </span>
        </ReturnToLink>
      </TableCell>
      <TableCell>{teacher.documentNumber}</TableCell>
      <TableCell>{teacher.phoneNumber ?? <span className="text-muted-foreground/60">Sin teléfono</span>}</TableCell>
      <TableCell>{teacher.email ?? <span className="text-muted-foreground/60">Sin email</span>}</TableCell>
      <TableCell>
        <Badge variant={teacher.enabled ? "secondary" : "outline"}>{teacher.enabled ? "Activo" : "Inactivo"}</Badge>
      </TableCell>
    </TableRow>
  );
}
