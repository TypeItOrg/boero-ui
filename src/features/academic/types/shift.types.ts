export type Shift = {
  id: string;
  institutionId: string;
  name: string;
  description: string | null;
  active: boolean;
  deletedAt?: string | null;
};
