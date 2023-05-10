import { EventTypeDto } from '@hop-backend-api';

export namespace EventTypesActions {

  export class Initialize {
    static readonly type = '[EventTypesActions] Initialize';
  }

  export class Create {
    static readonly type = '[EventTypesActions] Create';

    constructor(public data: Partial<EventTypeDto>) {}
  }

  export class Update {
    static readonly type = '[EventTypesActions] Update';

    constructor(public id: string, public data: Partial<EventTypeDto>, public skipHistory = false) {}
  }

  export class Remove {
    static readonly type = '[EventTypesActions] Remove';

    constructor(public id: string) {}
  }
}
