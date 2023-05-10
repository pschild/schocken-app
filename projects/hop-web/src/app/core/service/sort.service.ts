import { Injectable } from '@angular/core';

export enum SortDirection {
  ASC = 'ascending',
  DESC = 'descending'
}

/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root'
})
export class SortService {

  constructor() { }

  compare(a: any, b: any, propName: string, direction: SortDirection = SortDirection.ASC) {
    if (a[propName] > b[propName]) {
      return direction === SortDirection.ASC ? 1 : -1;
    }
    if (a[propName] < b[propName]) {
      return direction === SortDirection.ASC ? -1 : 1;
    }
    return 0;
  }

}
