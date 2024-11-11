
interface Document {
  documentId: string;
}


export interface PaginatedList {
  self: string;
  items: Document[];
  total: number;
  pageSize: number;
  links: {
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}
