import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RoundDataProvider } from './round.data-provider';
import { PlayerSelectionVo, RoundEventListItemVo, EventTypeItemVo } from '@hop-basic-components';
import { RoundDetailsVo } from './model/round-details.vo';

@Component({
  selector: 'hop-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  roundId$: Observable<string>;
  roundDetailsVo$: Observable<RoundDetailsVo>;
  attendingPlayerVos$: Observable<PlayerSelectionVo[]>;
  roundEvents$: Observable<RoundEventListItemVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;

  selectedPlayerId: string;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: RoundDataProvider
  ) { }

  ngOnInit() {
    this.roundId$ = this.route.params.pipe(
      map((params: Params) => params.roundId)
    );
    this.roundDetailsVo$ = this.roundId$.pipe(
      switchMap((roundId: string) => this.dataProvider.getRoundDetails(roundId))
    );
    this.attendingPlayerVos$ = this.roundId$.pipe(
      switchMap((roundId: string) => this.dataProvider.getAttendingPlayersByRoundId(roundId))
    );
    this.roundEventTypes$ = this.dataProvider.getRoundEventTypes();
  }

  onPlayerChanged(player: PlayerSelectionVo): void {
    this.selectedPlayerId = player.id;
    this._loadRoundEvents();
  }

  onAddEvent(eventTypeId: string): void {
    this.roundId$.pipe(
      switchMap((roundId: string) => this.dataProvider.createRoundEvent(roundId, this.selectedPlayerId, eventTypeId))
    ).subscribe(_ => this._loadRoundEvents());
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.removeRoundEvent(eventId).subscribe(_ => this._loadRoundEvents());
  }

  _loadRoundEvents(): void {
    this.roundEvents$ = this.roundId$.pipe(
      switchMap(roundId => this.dataProvider.getRoundEventsByPlayerAndRound(this.selectedPlayerId, roundId))
    );
  }

}
