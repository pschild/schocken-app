import { GameDto } from '@hop-backend-api';

export namespace GamesActions {

  export class Initialize {
    static readonly type = '[GamesActions] Initialize';
  }

  export class Create {
    static readonly type = '[GamesActions] Create';
  }

  export class Update {
    static readonly type = '[GamesActions] Update';

    constructor(public id: string, public data: Partial<GameDto>) {}
  }
}
