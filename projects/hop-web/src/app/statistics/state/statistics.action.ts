export namespace StatisticsActions {

  export class RefreshFilter {
    static readonly type = '[StatisticsActions] RefreshFilter';

    constructor(
      public from: Date,
      public to: Date,
      public activePlayersOnly: boolean,
      public completedGamesOnly: boolean
    ) {
    }
  }

  export class RefreshEventTypeFilter {
    static readonly type = '[StatisticsActions] RefreshEventTypeFilter';

    constructor(public ids: string[]) {
    }
  }

  export class RefreshGameIdFilter {
    static readonly type = '[StatisticsActions] RefreshGameIdFilter';

    constructor(public id: string) {
    }
  }

  export class RefreshScoringType {
    static readonly type = '[StatisticsActions] RefreshScoringType';

    constructor(
      public type: any
    ) {
    }
  }

  export class ResetGameIdFilter {
    static readonly type = '[StatisticsActions] ResetGameIdFilter';
  }
}
