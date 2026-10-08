import { InstitutionalHostKind } from "@common/services/institutional-host/institutional-host-kind.types";

export type InstitutionalHost =
  | { kind: InstitutionalHostKind.GENERIC; hostname: string }
  | { kind: InstitutionalHostKind.INSTITUTIONAL; hostname: string; publicSubdomain: string }
  | { kind: InstitutionalHostKind.INVALID };
