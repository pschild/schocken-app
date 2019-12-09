import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { RoundDataProvider } from './round.data-provider';
import { PlayerSelectionVo, RoundEventListItemVo, EventTypeItemVo, EventListItemVo } from '@hop-basic-components';
import { RoundDetailsVo } from './model/round-details.vo';
import { MatSlideToggleChange } from '@angular/material';
import { share } from 'rxjs/operators';

@Component({
  selector: 'hop-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  roundDetails$: Observable<RoundDetailsVo>;
  roundEvents$: Observable<RoundEventListItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;
  combinedEvents$: Observable<EventListItemVo[]>;

  attendeeList$: Observable<PlayerSelectionVo[]>;
  isInGame$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: RoundDataProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => this.dataProvider.loadRoundDetails(params.roundId));
    this.dataProvider.loadRoundEventTypes();

    this.roundDetails$ = this.dataProvider.getRoundDetailsState().pipe(share());
    this.roundEvents$ = this.dataProvider.getRoundEventsState();
    this.roundEventTypes$ = this.dataProvider.getRoundEventTypesState();
    this.combinedEvents$ = this.dataProvider.getCombinedRoundEventListState();

    this.attendeeList$ = this.dataProvider.getAttendeeList();
    this.isInGame$ = this.dataProvider.getIsInGame();
  }

  onPlayerChanged(playerId: string): void {
    this.dataProvider.handlePlayerChanged(playerId);
  }

  onInGameStatusChanged(event: MatSlideToggleChange) {
    this.dataProvider.handleInGameStatusChanged(event.checked);
  }

  onAddEvent(eventType: EventTypeItemVo): void {
    this.dataProvider.handleEventAdded(eventType);
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.handleEventRemoved(eventId);
  }
}
