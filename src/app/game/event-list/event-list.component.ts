import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventType, GameEvent, RoundEvent, Event } from 'src/app/interfaces';
import { Observable, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, switchMap, map, share, tap, startWith } from 'rxjs/operators';
import { GameEventService } from 'src/app/game-event.service';
import { EventTypeService } from 'src/app/event-type.service';
import { GetResponse, FindResponse, RemoveResponse } from 'src/app/pouchDb.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit, OnChanges {

  @Input() gameId: string;
  @Input() roundId: string;
  @Input() playerId: string;

  gameId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  roundId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  playerId$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  eventTypes$: Observable<EventType[]>;
  eventsForPlayer$: Observable<Event[]>;
  gameEventsForPlayer$: Observable<GameEvent[]>;
  roundEventsForPlayer$: Observable<RoundEvent[]>;
  mergedList$: Observable<any>;
  penaltySum$: Observable<number>;
  reload$ = new Subject<void>();

  constructor(private gameEventService: GameEventService, private eventTypeService: EventTypeService) { }

  ngOnInit() {
    this.eventTypes$ = this.eventTypeService.getAll().pipe(
      map((response: GetResponse<EventType>) => response.rows.map(row => row.doc))
    );

    this.eventsForPlayer$ = combineLatest(
      this.gameId$,
      this.roundId$,
      this.playerId$,
      this.reload$.pipe(startWith(null))
    ).pipe(
      filter(([gameId, roundId, playerId]) => (!!gameId || !!roundId) && !!playerId),
      switchMap(([gameId, roundId, playerId]) => {
        return this.gameEventService.getAllByGameIdAndPlayerId(gameId, playerId);
      }),
      map((response: FindResponse<Event>) => response.docs)
    );

    this.mergedList$ = combineLatest(this.eventTypes$, this.eventsForPlayer$).pipe(
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

    this.penaltySum$ = this.mergedList$.pipe(
      map(mergedItems => {
        let sum = 0;
        mergedItems.map(item => {
          // TODO: calculate penalty from history
          const penalty = item.eventType.penalty || 0;
          const eventTypeValue = item.event.eventTypeValue || 1;
          sum += penalty * eventTypeValue;
        });
        return sum;
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

  handleRemoveRoundEventClicked(event: Event) {
    this.gameEventService.remove(event as GameEvent)
      .subscribe((response: RemoveResponse) => {
        this.reload$.next();
      });
  }

}
