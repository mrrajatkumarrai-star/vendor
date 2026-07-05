export type ViewMode = 'mindmap' | 'table';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SortingState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SelectOption {
  label: string;
  value: string;
}

export type ExportScope = 'current' | 'selected' | 'filtered' | 'all';

export interface ImportRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
  isDuplicate: boolean;
  isValid: boolean;
}

export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: Array<{ row: number; message: string }>;
}
