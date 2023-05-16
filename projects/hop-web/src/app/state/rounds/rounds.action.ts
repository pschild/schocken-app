import { RoundDto } from '@hop-backend-api';

export namespace RoundsActions {

  export class Initialize {
    static readonly type = '[RoundsActions] Initialize';
  }

  export class Create {
    static readonly type = '[RoundsActions] Create';

    constructor(public data: Partial<RoundDto>) {}
  }

  export class Update {
    static readonly type = '[RoundsActions] Update';

    constructor(public id: string, public data: Partial<RoundDto>) {}
  }
}
