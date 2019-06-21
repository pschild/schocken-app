import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventType, GameEvent, RoundEvent, Event, EntityType } from 'src/app/interfaces';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { filter, switchMap, map, share } from 'rxjs/operators';
import { GameEventService } from 'src/app/game-event.service';
import { EventTypeService } from 'src/app/event-type.service';
import { GetResponse, FindResponse, RemoveResponse } from 'src/app/pouchDb.service';
import { GameStateService } from '../game-state.service';
import { RoundEventService } from 'src/app/round-event.service';

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
  penalties$: Observable<Array<{unit: string, sum: number}>>;

  constructor(
    private gameEventService: GameEventService,
    private roundEventService: RoundEventService,
    private eventTypeService: EventTypeService,
    private state: GameStateService
  ) { }

  ngOnInit() {
    this.eventTypes$ = this.eventTypeService.getAll().pipe(
      map((response: GetResponse<EventType>) => response.rows.map(row => row.doc))
    );

    const latestInputs$ = combineLatest(this.gameId$, this.roundId$, this.playerId$);

    // handle game events
    latestInputs$.pipe(
      filter(([gameId, roundId, playerId]) => !!gameId && !!playerId),
      switchMap(([gameId, roundId, playerId]) => this.gameEventService.getAllByGameIdAndPlayerId(gameId, playerId)),
      map((response: FindResponse<GameEvent>) => response.docs)
    ).subscribe((events: GameEvent[]) => this.state.eventsForPlayer$.next(events));

    // handle round events
    latestInputs$.pipe(
      filter(([gameId, roundId, playerId]) => !!roundId && !!playerId),
      switchMap(([gameId, roundId, playerId]) => this.roundEventService.getAllByRoundIdAndPlayerId(roundId, playerId)),
      map((response: FindResponse<RoundEvent>) => response.docs)
    ).subscribe((events: RoundEvent[]) => this.state.eventsForPlayer$.next(events));

    this.mergedList$ = combineLatest(this.eventTypes$, this.state.eventsForPlayer$).pipe(
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

    this.penalties$ = this.mergedList$.pipe(
      map(mergedItems => {
        const groupedByPenaltyUnit = mergedItems.reduce((penaltyUnits, item) => {
          if (!item.eventType.penalty.unit) {
            return penaltyUnits;
          }
          const group = (penaltyUnits[item.eventType.penalty.unit] || []);
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
            if (item.eventType.valueUnit) {
              return tempSum += item.event.eventTypeValue * item.eventType.penalty.value;
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
    let removeCall;
    if (event.type === EntityType.GAME_EVENT) {
      removeCall = this.gameEventService.remove(event as GameEvent);
    } else if (event.type === EntityType.ROUND_EVENT) {
      removeCall = this.roundEventService.remove(event as RoundEvent);
    }

    removeCall.subscribe((response: RemoveResponse) => {
      const newList = this.state.eventsForPlayer$.getValue().filter((e: Event) => event._id !== e._id);
      this.state.eventsForPlayer$.next(newList);
    });
  }

}
