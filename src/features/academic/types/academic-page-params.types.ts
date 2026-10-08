import "server-only";

export type PageParams = {
  deleted?: boolean;
  institutionId?: string;
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
};
