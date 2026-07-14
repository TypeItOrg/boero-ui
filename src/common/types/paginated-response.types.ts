export type PaginatedResponse<TItem> = {
  items: TItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};
