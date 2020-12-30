import { groupBy, orderBy } from 'lodash';
import { RoundDto } from 'projects/hop-backend-api/src/lib/round/model/round.dto';

interface RoundsPerGameItem {
  gameId: string;
  rounds: RoundDto[];
}

export const groupRoundsByGame = (rounds: RoundDto[]): RoundsPerGameItem[] => {
  const roundsByGameId = groupBy(rounds, 'gameId');
  return Object.keys(roundsByGameId)
      .map(gameId => ({ gameId, rounds: orderBy(roundsByGameId[gameId], 'datetime', 'asc') }));
};
