import { countBy, includes } from 'lodash';
import { PlayerDto, PlayerDtoUtils } from 'projects/hop-backend-api/src/lib/player/model/player.dto';
import { ParticipationDto } from 'projects/hop-backend-api/src/lib/round/model/participation.dto';
import { RoundDto } from 'projects/hop-backend-api/src/lib/round/model/round.dto';

interface RoundCountItem {
  playerId: string;
  name: string;
  roundCount: number;
}

export const getRoundCountByPlayer = (players: PlayerDto[], rounds: RoundDto[]): RoundCountItem[] => {
  const participations: ParticipationDto[][] = rounds.map((round: RoundDto) => round.attendeeList);
  const flatParticipations: ParticipationDto[] = [].concat.apply([], participations);
  const countByPlayer = countBy(flatParticipations, 'playerId');
  return Object.keys(countByPlayer)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ playerId, roundCount: countByPlayer[playerId] }))
      .map(item => ({
        name: PlayerDtoUtils.findNameById(players, item.playerId),
        ...item
      }));
};
