export interface IColumnInterface {
  columnDef: string;
  header: string;
  isHidden?: boolean;
  cellContent?: (element: any) => string;
  cellActions?: Array<{ icon?: string; label?: string; fn: (element: any) => any }>;
  icon?: string;
  isSearchable?: boolean;
}
