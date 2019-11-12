import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, switchMap, withLatestFrom, take, filter } from 'rxjs/operators';
import { RoundDataProvider } from './round.data-provider';
import { PlayerSelectionVo, RoundEventListItemVo, EventTypeItemVo } from '@hop-basic-components';
import { RoundDetailsVo } from './model/round-details.vo';
import { MatSlideToggleChange } from '@angular/material';
import { ParticipationDto } from 'projects/hop-backend-api/src/lib/round';

@Component({
  selector: 'hop-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.scss']
})
export class RoundComponent implements OnInit {

  roundId$: Observable<string>;
  roundDetailsState$: BehaviorSubject<RoundDetailsVo> = new BehaviorSubject(null);
  attendingPlayerVos$: Observable<PlayerSelectionVo[]>;
  roundEventTypes$: Observable<EventTypeItemVo[]>;
  roundEvents$: Observable<RoundEventListItemVo[]>;

  constructor(
    private route: ActivatedRoute,
    private dataProvider: RoundDataProvider
  ) { }

  ngOnInit() {
    this.roundId$ = this.route.params.pipe(
      map((params: Params) => params.roundId)
    );

    this.roundId$.pipe(
      switchMap((roundId: string) => this.dataProvider.getRoundDetails(roundId))
    ).subscribe((round: RoundDetailsVo) => this.roundDetailsState$.next(round));

    this.attendingPlayerVos$ = this.roundDetailsState$.pipe(
      switchMap((round: RoundDetailsVo) => this.dataProvider.getAttendingPlayers(round.attendeeList))
    );

    this.roundEventTypes$ = this.dataProvider.getRoundEventTypes();
  }

  onPlayerChanged(playerId: string): void {
    this.roundDetailsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map((roundDetails: RoundDetailsVo) => {
        return { ...roundDetails, currentPlayerId: playerId };
      }),
      switchMap((updatedRoundDetails: RoundDetailsVo) => forkJoin(
        of(updatedRoundDetails),
        this.dataProvider.updateRound(updatedRoundDetails.id, { currentPlayerId: updatedRoundDetails.currentPlayerId })
      ))
    ).subscribe(([updatedRoundDetails, roundId]: [RoundDetailsVo, string]) => {
      this.roundDetailsState$.next(updatedRoundDetails);
      this._loadRoundEvents();
    });
  }

  onInGameStatusChanged(event: MatSlideToggleChange) {
    this.roundDetailsState$.pipe(
      take(1), // because in the subscription the source observable will receive a new value
      map((roundDetails: RoundDetailsVo) => {
        const tempAttendeeList = [...roundDetails.attendeeList];
        const currentPlayer = tempAttendeeList.find(i => i.playerId === roundDetails.currentPlayerId);
        currentPlayer.inGameStatus = event.checked;
        roundDetails.attendeeList = tempAttendeeList;
        return roundDetails;
      }),
      switchMap((roundDetails: RoundDetailsVo) => forkJoin(
        of(roundDetails),
        this.dataProvider.updateRound(roundDetails.id, { attendeeList: roundDetails.attendeeList })
      )),
      map(([roundDetails, roundId]: [RoundDetailsVo, string]) => ({ ...roundDetails, attendeeList: roundDetails.attendeeList }))
    ).subscribe((updatedRoundDetails: RoundDetailsVo) => this.roundDetailsState$.next(updatedRoundDetails));
  }

  currentPlayerIsInGame() {
    return this.roundDetailsState$.pipe(
      filter((roundDetails: RoundDetailsVo) => roundDetails && roundDetails.attendeeList && roundDetails.attendeeList.length > 0),
      map((roundDetails: RoundDetailsVo) => {
        return roundDetails.attendeeList.find(
          (attendee: ParticipationDto) => attendee.playerId === roundDetails.currentPlayerId
        ).inGameStatus;
      })
    );
  }

  onAddEvent(eventTypeId: string): void {
    this.roundId$.pipe(
      withLatestFrom(this.roundDetailsState$),
      switchMap(([roundId, roundDetails]: [string, RoundDetailsVo]) => this.dataProvider.createRoundEvent(
        roundId, roundDetails.currentPlayerId, eventTypeId
      ))
    ).subscribe(_ => this._loadRoundEvents());
  }

  onRemoveEvent(eventId: string): void {
    this.dataProvider.removeRoundEvent(eventId).subscribe(_ => this._loadRoundEvents());
  }

  _loadRoundEvents(): void {
    this.roundEvents$ = this.roundId$.pipe(
      withLatestFrom(this.roundDetailsState$),
      switchMap(([roundId, roundDetails]: [string, RoundDetailsVo]) => this.dataProvider.getRoundEventsByPlayerAndRound(
        roundDetails.currentPlayerId, roundId
      ))
    );
  }
}
