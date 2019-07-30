import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { EventType, EventTypeContext } from '../../interfaces';
import { map, filter, switchMap } from 'rxjs/operators';
import { EventTypeProvider } from 'src/app/core/provider/event-type.provider';
import { FindResponse } from 'src/app/core/adapter/pouchdb.adapter';

@Component({
  selector: 'app-event-type-list',
  templateUrl: './event-type-list.component.html',
  styleUrls: ['./event-type-list.component.scss']
})
export class EventTypeListComponent implements OnInit, OnChanges {

  @Input() gameId: string;
  @Input() roundId: string;

  @Output() addEvent = new EventEmitter();

  gameId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  roundId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
  latestInputs$: Observable<string[]>;

  allEventTypes$: Observable<Array<EventType>>;

  constructor(
    private eventTypeProvider: EventTypeProvider
  ) { }

  ngOnInit() {
    this.latestInputs$ = combineLatest(this.gameId$, this.roundId$);

    this.allEventTypes$ = this.latestInputs$.pipe(
      filter(([gameId, roundId]: [string, string]) => !!roundId || !!gameId),
      switchMap(([gameId, roundId]: [string, string]) => {
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
  }

  handleEventTypeClicked(eventType: EventType) {
    this.addEvent.emit(eventType);
  }

}
