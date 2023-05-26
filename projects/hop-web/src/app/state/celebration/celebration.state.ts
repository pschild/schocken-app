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
  1,
  100, 200, 300, 400, 500, 600, 700, 800, 900,
  1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,
  10000,
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
        return this.checkEventCountsToCelebrate(eventCount, eventType.description);
      }),
    ).subscribe();
  }

  private checkEventCountsToCelebrate(countValue: number, eventName: string): Observable<any> {
    if (NUMBERS_TO_CELEBRATE.includes(countValue)) {
      return this.ngZone.run<Observable<any>>(() => {
        return this.dialogService.openCustomDialog(
          CelebrationModalComponent,
          {
            height: '80%',
            width: '90%',
            autoFocus: false,
            data: {
              countValue,
              eventName
            }
          }
        );
      });
    }
    return of(null);
  }

}
