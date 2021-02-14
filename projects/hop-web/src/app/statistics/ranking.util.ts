import { groupBy, Many, orderBy } from 'lodash';

export interface Ranking {
  rank: number;
  items: any[];
}

// tslint:disable-next-line:no-namespace
export namespace RankingUtil {

  export function sort(collection: any, compareKeys: string[], directions?: Many<'asc'|'desc'>): Ranking[] {
    directions = directions || compareKeys.map(key => 'desc');

    let rank = 1;
    const groupedByPrimaryKey = groupBy(collection, item => compareKeys.reduce((acc, cur) => item[acc] + item[cur], compareKeys[0]));
    return Object.keys(groupedByPrimaryKey)
      .sort((a, b) => +b - +a)
      .map(key => ({ rank: rank++, items: orderBy(groupedByPrimaryKey[key], compareKeys, directions) }));
  }

}
