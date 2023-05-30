import { EventTypeTrigger } from '@hop-backend-api';

export namespace EventsActions {

  export class Initialize {
    static readonly type = '[EventsActions] Initialize';
  }

  export class CreateGameEvent {
    static readonly type = '[EventsActions] CreateGameEvent';

    constructor(public data: {
      eventTypeId: string;
      multiplicatorValue?: number;
      comment?: string;
      trigger?: EventTypeTrigger;
      playerId: string;
      gameId: string;
    }) {}
  }

  export class RemoveGameEvent {
    static readonly type = '[EventsActions] RemoveGameEvent';

    constructor(public id: string) {}
  }

  export class CreateRoundEvent {
    static readonly type = '[EventsActions] CreateRoundEvent';

    constructor(public data: {
      eventTypeId: string;
      multiplicatorValue?: number;
      comment?: string;
      trigger?: EventTypeTrigger;
      playerId: string;
      roundId: string;
    }) {}
  }

  export class CreateRoundEvents {
    static readonly type = '[EventsActions] CreateRoundEvents';

    constructor(public data: {
      eventTypeId: string;
      multiplicatorValue?: number;
      comment?: string;
      trigger?: EventTypeTrigger;
      playerId: string;
      roundId: string;
    }[]) {}
  }

  export class RemoveRoundEvent {
    static readonly type = '[EventsActions] RemoveRoundEvent';

    constructor(public id: string) {}
  }
}
