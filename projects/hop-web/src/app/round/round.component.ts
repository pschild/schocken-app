import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { RoundDataProvider } from './round.data-provider';
import { PlayerSelectionVo, RoundEventListItemVo, EventTypeItemVo } from '@hop-basic-components';
import { RoundDetailsVo } from './model/round-details.vo';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'hop-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  attendeeList$: Observable<PlayerSelectionVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;
  roundEvents$: Observable<RoundEventListItemVo[]>;

  roundDetails$: Observable<RoundDetailsVo>;
  isInGame$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: RoundDataProvider
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => this.dataProvider.loadRoundDetails(params.roundId));

    this.roundDetails$ = this.dataProvider.getRoundDetailsState();
    this.roundEvents$ = this.dataProvider.getRoundEventsState();

    this.attendeeList$ = this.dataProvider.getAttendeeList();
    this.isInGame$ = this.dataProvider.getIsInGame();
    this.roundEventTypes$ = this.dataProvider.loadRoundEventTypes();
  }

  onPlayerChanged(playerId: string): void {
    this.dataProvider.handlePlayerChanged(playerId);
  }

  onInGameStatusChanged(event: MatSlideToggleChange) {
    this.dataProvider.handleInGameStatusChanged(event.checked);
  }

  onAddEvent(eventTypeId: string): void {
    this.dataProvider.handleEventAdded(eventTypeId);
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.handleEventRemoved(eventId);
  }
}
