import { Injectable, NgZone } from '@angular/core';
import { CelebrationModalComponent, DialogService } from '@hop-basic-components';
import { Actions, NgxsOnInit, State, StateContext, StateToken, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ActiveGameActions } from '../../game/state';
import { EventTypesState } from '../event-types/event-types.state';
import { EventsState } from '../events/events.state';
import { RoundsState } from '../rounds/rounds.state';

export interface CelebrationStateModel {
}

export const CELEBRATION_STATE = new StateToken<CelebrationStateModel>('celebration');

const NUMBERS_TO_CELEBRATE: number[] = [
  1, 100, 200, 300, 400, 600, 700, 800, 900
];

@State<CelebrationStateModel>({
  name: CELEBRATION_STATE,
  defaults: {
  }
})

@Injectable()
export class CelebrationState implements NgxsOnInit {

  constructor(
    private store: Store,
    private actions$: Actions,
    private dialogService: DialogService,
    private ngZone: NgZone
  ) {}

  ngxsOnInit(ctx: StateContext<any>): void {
    this.actions$.pipe(
      ofActionSuccessful(ActiveGameActions.StartNewRound),
      mergeMap(() => {
        const roundCount = this.store.selectSnapshot(RoundsState.rounds).length;
        return this.checkEventCountsToCelebrate(roundCount, 'Runden');
      }),
    ).subscribe();

    this.actions$.pipe(
      ofActionSuccessful(ActiveGameActions.GameEventAdded, ActiveGameActions.RoundEventAdded),
      mergeMap(action => {
        const eventCount = this.store.selectSnapshot(EventsState.countByEventTypeId(action.eventTypeId));
        const eventType = this.store.selectSnapshot(EventTypesState.byId(action.eventTypeId));
        return this.checkEventCountsToCelebrate(eventCount, eventType.description, action.addedCount);
      }),
    ).subscribe();
  }

  private checkEventCountsToCelebrate(countValue: number, eventName: string, addedCount = 1): Observable<any> {
    const celebrationNumber = this.getCelebrationNumber(countValue, addedCount);
    if (celebrationNumber > 0) {
      return this.ngZone.run<Observable<any>>(() => {
        return this.dialogService.openCustomDialog(
          CelebrationModalComponent,
          {
            autoFocus: false,
            data: {
              countValue: celebrationNumber,
              eventName
            }
          }
        );
      });
    }
    return of(null);
  }

  private getCelebrationNumber(countValue: number, addedCount: number): number {
    for (let i = countValue - addedCount + 1; i <= countValue; i++) {
      console.log(i % 500);
      if (NUMBERS_TO_CELEBRATE.includes(i) || i % 500 === 0) {
        return i;
      }
    }
    return -1;
  }

}
