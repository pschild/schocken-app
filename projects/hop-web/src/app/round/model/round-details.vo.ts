export class RoundDetailsVo {
  id: string;
  datetime: Date;
  currentPlayerId: string;
  roundIndex: number;
  nextRoundId: string | undefined;
  previousRoundId: string | undefined;
  completed: boolean;
}
