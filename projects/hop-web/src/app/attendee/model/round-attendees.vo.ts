export class RoundAttendeesVo {
  id: string;
  currentPlayerId: string;
  attendees: {playerId: string; inGameStatus: boolean}[];
}
