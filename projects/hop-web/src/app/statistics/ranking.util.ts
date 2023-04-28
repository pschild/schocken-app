import { groupBy } from 'lodash';

export interface Ranking {
  rank: number;
  items: any[];
}

// tslint:disable-next-line:no-namespace
export namespace RankingUtil {

  export function sort(collection: any, compareKeys: string[], direction: 'asc'|'desc' = 'desc'): Ranking[] {
    let rank = 1;
    const groupedByPrimaryKey = groupBy(collection, item =>
      compareKeys.length > 1
      ? compareKeys.reduce((acc, cur) => item[acc] + item[cur])
      : item[compareKeys[0]]
    );
    return Object.keys(groupedByPrimaryKey)
      .sort((a, b) => direction === 'asc' ? +a - +b : +b - +a)
      .map(key => ({ rank: rank++, items: groupedByPrimaryKey[key] }));
  }

}
