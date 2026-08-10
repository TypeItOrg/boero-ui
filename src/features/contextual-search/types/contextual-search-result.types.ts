export type ContextualSearchResult = {
  id: string;
  institutionId: string | null;
  institutionName: string | null;
  institutionActive: boolean | null;
  title: string;
  subtitle: string | null;
  status: string | null;
  category: string | null;
};
