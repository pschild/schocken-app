import { Row } from './row.model';

export interface GetResponse<E> {
  offset: number;
  total_rows: number;
  rows: Array<Row<E>>;
}
