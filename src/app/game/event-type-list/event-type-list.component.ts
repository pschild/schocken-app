import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { EventTypeService } from 'src/app/event-type.service';
import { EventType, EventTypeContext, Event } from 'src/app/interfaces';
import { FindResponse, PutResponse } from 'src/app/pouchDb.service';
import { map, filter, switchMap } from 'rxjs/operators';
import { GameEventService } from 'src/app/game-event.service';
import { GameStateService } from '../game-state.service';
import { RoundEventService } from 'src/app/round-event.service';

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
    private gameEventService: GameEventService,
    private roundEventService: RoundEventService,
    private eventTypeService: EventTypeService,
    private state: GameStateService
  ) { }

  ngOnInit() {
    this.latestInputs$ = combineLatest(this.gameId$, this.roundId$);

    this.allEventTypes$ = this.latestInputs$.pipe(
      filter(([gameId, roundId]) => !!roundId || !!gameId),
      switchMap(([gameId, roundId]) => {
        if (gameId) {
          return this.eventTypeService.getAllByContext(EventTypeContext.GAME);
        } else {
          return this.eventTypeService.getAllByContext(EventTypeContext.ROUND);
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

    const createGameEvent$ = this.gameEventService.create({
      eventTypeId: eventType._id,
      gameId,
      playerId,
      eventTypeValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.gameEventService.getById(response.id))
    );

    const createRoundEvent$ = this.roundEventService.create({
      eventTypeId: eventType._id,
      roundId,
      playerId,
      eventTypeValue: eventType['formValue']
    }).pipe(
      switchMap((response: PutResponse) => this.gameEventService.getById(response.id))
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
