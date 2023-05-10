import { EventDto } from '@hop-backend-api';

export namespace EventsActions {

  export class Initialize {
    static readonly type = '[EventsActions] Initialize';
  }

  export class Create {
    static readonly type = '[EventsActions] Create';

    constructor(public data: Partial<EventDto>) {}
  }

  export class Update {
    static readonly type = '[EventsActions] Update';

    constructor(public id: string, public data: Partial<EventDto>) {}
  }

  export class Remove {
    static readonly type = '[EventsActions] Remove';

    constructor(public id: string) {}
  }
}
