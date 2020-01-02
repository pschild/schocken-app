import { ParticipationDto } from '@hop-backend-api';

export class RoundDetailsVo {
  id: string;
  gameId: string;
  datetime: Date;
  currentPlayerId: string;
  attendeeList: ParticipationDto[];
  roundIndex: number;
  nextRoundId: string | undefined;
  previousRoundId: string | undefined;
  completed: boolean;
}
