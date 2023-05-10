import { PlayerDto } from '@hop-backend-api';

export namespace PlayersActions {

  export class Initialize {
    static readonly type = '[PlayersActions] Initialize';
  }

  export class Create {
    static readonly type = '[PlayersActions] Create';

    constructor(public data: Partial<PlayerDto>) {}
  }

  export class Update {
    static readonly type = '[PlayersActions] Update';

    constructor(public id: string, public data: Partial<PlayerDto>) {}
  }

  export class Remove {
    static readonly type = '[PlayersActions] Remove';

    constructor(public id: string) {}
  }
}
