import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { EventType, GameEvent, RoundEvent, Event } from 'src/app/interfaces';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap, map, share } from 'rxjs/operators';
import { EventTypeProvider } from 'src/app/core/provider/event-type.provider';
import { select, Store } from '@ngrx/store';
import { selectRoundEvents, selectGameEvents } from 'src/app/store/selectors/game.selectors';
import { IAppState } from 'src/app/store/state/app.state';
import { getRoundEvents, getGameEvents } from 'src/app/store/actions/game.actions';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnChanges {

  @Input() gameId: string;
  @Input() roundId: string;
  @Input() playerId: string;

  @Output() removeEvent = new EventEmitter();

  gameId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  roundId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  playerId$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  eventTypes$: Observable<EventType[]>;
  eventsForPlayer$: Observable<Event[]>;
  gameEventsForPlayer$: Observable<GameEvent[]>;
  roundEventsForPlayer$: Observable<RoundEvent[]>;
  mergedList$: Observable<any>;
  penalties$: Observable<Array<{unit: string, sum: number}>>;

  constructor(
    private eventTypeProvider: EventTypeProvider,
    private store: Store<IAppState>
  ) { }

  ngOnInit() {
    this.eventTypes$ = this.eventTypeProvider.getAll();

    const latestInputs$ = combineLatest(this.gameId$, this.roundId$, this.playerId$);

    // handle game events
    latestInputs$.pipe(
      filter(([gameId, roundId, playerId]) => !!gameId && !!playerId)
    ).subscribe(([gameId, roundId, playerId]) => this.store.dispatch(getGameEvents({ gameId, playerId })));

    // handle round events
    latestInputs$.pipe(
      filter(([gameId, roundId, playerId]) => !!roundId && !!playerId)
    ).subscribe(([gameId, roundId, playerId]) => this.store.dispatch(getRoundEvents({ roundId, playerId })));

    this.roundEventsForPlayer$ = this.playerId$.pipe(
      switchMap(playerId => this.store.pipe(select(selectRoundEvents, { playerId })))
    );

    this.gameEventsForPlayer$ = this.playerId$.pipe(
      switchMap(playerId => this.store.pipe(select(selectGameEvents, { playerId })))
    );

    // TODO: move to service
    this.mergedList$ = combineLatest(
      this.eventTypes$,
      this.gameId ? this.gameEventsForPlayer$ : this.roundEventsForPlayer$
    ).pipe(
      map(result => {
        const eventTypes: EventType[] = result[0];
        const allEventsForPlayer: Event[] = result[1];
        return allEventsForPlayer.map((event: Event) => ({
          event,
          eventType: eventTypes.find((eventType: EventType) => eventType._id === event.eventTypeId)
        }));
      }),
      share()
    );

    // TODO: move to service
    this.penalties$ = this.mergedList$.pipe(
      map(mergedItems => {
        const groupedByPenaltyUnit = mergedItems.reduce((penaltyUnits, item) => {
          if (!item.eventType.penalty || !item.eventType.penalty.unit) {
            return penaltyUnits;
          }
          const group = penaltyUnits[item.eventType.penalty.unit] || [];
          group.push(item);
          penaltyUnits[item.eventType.penalty.unit] = group;
          return penaltyUnits;
        }, {});
        return groupedByPenaltyUnit;
      }),
      map(groupedItems => {
        // TODO: calculate penalty from history
        // TODO: move to service
        const sums = [];
        Object.keys(groupedItems).map(key => {
          const sum = groupedItems[key].reduce((tempSum, item) => {
            if (item.eventType.multiplicatorUnit) {
              return tempSum += item.event.multiplicatorValue * item.eventType.penalty.value;
            }
            return tempSum += item.eventType.penalty.value;
          }, 0);
          sums.push({ unit: key, sum });
        });
        return sums;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.gameId) {
      this.gameId$.next(changes.gameId.currentValue);
    }
    if (changes.roundId) {
      this.roundId$.next(changes.roundId.currentValue);
    }
    if (changes.playerId) {
      this.playerId$.next(changes.playerId.currentValue);
    }
  }

  handleRemoveEventClicked(event: Event) {
    this.removeEvent.emit(event);
  }

}
