import { PlayerDto } from '@hop-backend-api';

export namespace ActiveGameActions {

  export class Initialize {
    static readonly type = '[ActiveGameActions] Initialize';

    constructor(public gameId: string) {}
  }

  export class AddGameEvent {
    static readonly type = '[ActiveGameActions] AddGameEvent';

    constructor(public player: PlayerDto) {}
  }

  export class AddRoundEvent {
    static readonly type = '[ActiveGameActions] AddRoundEvent';

    constructor(public player: PlayerDto, public roundId: string) {}
  }

  export class GameEventAdded {
    static readonly type = '[ActiveGameActions] GameEventAdded';

    constructor(public eventTypeId: string) {}
  }

  export class RoundEventAdded {
    static readonly type = '[ActiveGameActions] RoundEventAdded';

    constructor(public eventTypeId: string) {}
  }

  export class RemoveGameEvent {
    static readonly type = '[ActiveGameActions] RemoveGameEvent';

    constructor(public eventId: string) {}
  }

  export class RemoveRoundEvent {
    static readonly type = '[ActiveGameActions] RemoveRoundEvent';

    constructor(public eventId: string) {}
  }

  export class StartNewRound {
    static readonly type = '[ActiveGameActions] StartNewRound';
  }

  export class ChangeParticipation {
    static readonly type = '[ActiveGameActions] ChangeParticipation';

    constructor(public playerId: string, public roundId: string, public isParticipating: boolean) {}
  }
}
