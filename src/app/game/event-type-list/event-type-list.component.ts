import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { EventType, EventTypeContext, Event, EventTypePenalty } from '../../interfaces';
import { map, filter, switchMap } from 'rxjs/operators';
import { GameStateService } from '../game-state.service';
import { FindResponse, PutResponse } from 'src/app/db/pouchdb.adapter';
import { GameEventProvider } from 'src/app/provider/game-event.provider';
import { RoundEventProvider } from 'src/app/provider/round-event.provider';
import { EventTypeProvider } from 'src/app/provider/event-type.provider';

@Component({
  selector: 'app-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit, OnChanges {

  @Input() gameId: string;
  @Input() roundId: string;
  @Input() playerId: string;

  @Output() lostEvent = new EventEmitter();
  @Output() schockAusEvent = new EventEmitter();

  gameId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  roundId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  playerId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  latestInputs$: Observable<string[]>;

  allEventTypes$: Observable<Array<EventType>>;

  constructor(
    private gameEventProvider: GameEventProvider,
    private roundEventProvider: RoundEventProvider,
    private eventTypeProvider: EventTypeProvider,
    private state: GameStateService
  ) { }

  ngOnInit() {
    this.latestInputs$ = combineLatest(this.gameId$, this.roundId$);

    this.allEventTypes$ = this.latestInputs$.pipe(
      filter(([gameId, roundId]) => !!roundId || !!gameId),
      switchMap(([gameId, roundId]) => {
        if (gameId) {
          return this.eventTypeProvider.getAllByContext(EventTypeContext.GAME);
        } else {
          return this.eventTypeProvider.getAllByContext(EventTypeContext.ROUND);
        }
      }),
      map((response: FindResponse<EventType>) => response.docs)
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

  handleEventTypeClicked(eventType: EventType) {
    const gameId = this.gameId$.getValue();
    const roundId = this.roundId$.getValue();
    const playerId = this.playerId$.getValue();

    const createGameEvent$ = this.gameEventProvider.create({
      eventTypeId: eventType._id,
      gameId,
      playerId,
      multiplicatorValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.gameEventProvider.getById(response.id))
    );

    const createRoundEvent$ = this.roundEventProvider.create({
      eventTypeId: eventType._id,
      roundId,
      playerId,
      multiplicatorValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.gameEventProvider.getById(response.id))
    );

    const save$ = gameId ? createGameEvent$ : createRoundEvent$;
    save$.subscribe((event: Event) => {
      const newList = [event, ...this.state.eventsForPlayer$.getValue()];
      this.state.eventsForPlayer$.next(newList);
    });

    this._handleSpecialCases(eventType);
  }

  _handleSpecialCases(eventType: EventType) {
    switch (eventType._id) {
      case 'eventType-52612':
      case 'eventType-68434':
        this.lostEvent.emit();
        break;
      case 'eventType-42300':
        this.schockAusEvent.emit();
        break;
    }
  }

}
