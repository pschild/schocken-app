export interface ParticipationDto {
  playerId: string;
}

// tslint:disable-next-line:no-namespace
export namespace ParticipationDtoTestdaten {
  export function create(playerId: string): ParticipationDto {
    return { playerId };
  }

  export function createList(...playerIds: string[]): ParticipationDto[] {
    return playerIds.map(id => create(id));
  }
}
