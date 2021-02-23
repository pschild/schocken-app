import { RoundDto } from '@hop-backend-api';
import { groupBy, orderBy } from 'lodash';

// tslint:disable-next-line:no-namespace
export namespace StatisticsUtil {

  export function groupByGameIdAndSort(rounds: RoundDto[]): { gameId: string; rounds: RoundDto[]; }[] {
    const roundsByGameId = groupBy(rounds, 'gameId');
    return Object.keys(roundsByGameId)
      .map(gameId => ({ gameId, rounds: orderBy(roundsByGameId[gameId], 'datetime', 'asc') }));
  }

}
