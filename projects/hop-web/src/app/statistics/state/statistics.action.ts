export namespace StatisticsActions {

  export class RefreshFilter {
    static readonly type = '[StatisticsActions] RefreshFilter';

    constructor(public from: Date, public to: Date, public activePlayersOnly: boolean) {
    }
  }

  export class RefreshEventTypeFilter {
    static readonly type = '[StatisticsActions] RefreshEventTypeFilter';

    constructor(public ids: string[]) {
    }
  }
}
