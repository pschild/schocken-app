import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AttendeeDataProvider } from './attendee.data-provider';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AttendeeItemVo } from './model/attendee-item.vo';
import { RoundAttendeesVo } from './model/round-attendees.vo';
import { ParticipationDto } from '@hop-backend-api';

@Component({
  selector: 'hop-attendee',
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.scss']
})
export class AttendeeComponent implements OnInit {

  roundId$: Observable<string>;
  gameId$: Observable<string>;
  allPlayers$: Observable<AttendeeItemVo[]>;
  roundAttendees$: Observable<RoundAttendeesVo>;

  participatingPlayers: AttendeeItemVo[] = [];
  otherPlayers: AttendeeItemVo[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataProvider: AttendeeDataProvider
  ) { }

  ngOnInit() {
    this.gameId$ = this.route.queryParams.pipe(
      map((params: Params) => params.gameId)
    );
    this.roundId$ = this.route.params.pipe(
      map((params: Params) => params.roundId)
    );
    this.roundAttendees$ = this.roundId$.pipe(
      switchMap((roundId: string) => {
        if (roundId) {
          return this.dataProvider.getAttendeesByRoundId(roundId);
        }
        return of(null);
      })
    );
    this.allPlayers$ = this.dataProvider.getAllPlayers();

    combineLatest(this.allPlayers$, this.roundAttendees$).subscribe(
      ([allPlayers, roundAttendees]: [AttendeeItemVo[], RoundAttendeesVo]) => {
        const attendees = roundAttendees && roundAttendees.attendees || [];
        this.participatingPlayers = this._getParticipatingPlayers(allPlayers, attendees);
        this.otherPlayers = this._getNotParticipatingPlayers(allPlayers, attendees);
      }
    );
  }

  /**
   * Updates round and navigates to round.
   */
  onContinueRoundClick(): void {
    this.roundAttendees$.pipe(
      withLatestFrom(this.roundId$),
      switchMap(([roundAttendees, roundId]: [RoundAttendeesVo, string]) => this.dataProvider.setAttendeesForRound(
        roundId,
        this.participatingPlayers.map((player: AttendeeItemVo) => ({ playerId: player.id }))
      ))
    ).subscribe((updatedRoundId: string) => this.router.navigate(['round', updatedRoundId]));
  }

  /**
   * Navigates back, either to game or to round overview, depending on where the user came from.
   */
  onCancelClick(): void {
    combineLatest(this.roundId$, this.gameId$).subscribe(([roundId, gameId]: [string, string]) => {
      if (roundId) {
        this.router.navigate(['round', roundId]);
      } else if (gameId) {
        this.router.navigate(['game', gameId]);
      } else {
        throw new Error(`Either roundId or gameId must be available!`);
      }
    });
  }

  /**
   * Creates a game and a round, then navigates to the game overview.
   */
  onStartGameClick(): void {
    this.gameId$.pipe(
      switchMap((gameId: string) => this.dataProvider.createRound(
        gameId,
        this.participatingPlayers.map((player: AttendeeItemVo) => ({ playerId: player.id }))
      ))
    ).subscribe((createdRoundId: string) => this.router.navigate(['round', createdRoundId]));
  }

  dropOnParticipating(event: CdkDragDrop<string[]>): void {
    this._handleDrop(event);
  }

  dropOnOther(event: CdkDragDrop<string[]>): void {
    this._handleDrop(event);
  }

  private _handleDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /**
   * Returns a list of players that are attending in the round.
   * @param allPlayers All players from the database
   * @param attendees Players that are participating in a round
   * @returns A list of attending players for showing them in the correct list (UI)
   */
  private _getParticipatingPlayers(allPlayers: AttendeeItemVo[], attendees: ParticipationDto[]): AttendeeItemVo[] {
    const returnValue: AttendeeItemVo[] = [];
    let accordingPlayer: AttendeeItemVo;
    for (const attendee of attendees) {
      accordingPlayer = allPlayers.find((player: AttendeeItemVo) => player.id === attendee.playerId);
      returnValue.push({ id: accordingPlayer.id, name: accordingPlayer.name });
    }
    return returnValue;
  }

  /**
   * Returns a list of players that are not attending in the round.
   * @param allPlayers All players from the database
   * @param attendees Players that are participating in a round
   * @returns A list of not participating players for showing them in the correct list (UI)
   */
  private _getNotParticipatingPlayers(allPlayers: AttendeeItemVo[], attendees: ParticipationDto[]): AttendeeItemVo[] {
    return allPlayers
      .filter((player: AttendeeItemVo) => !attendees.find((attendee: ParticipationDto) => attendee.playerId === player.id))
      .map((player: AttendeeItemVo) => ({
        id: player.id,
        name: player.name
      }));
  }

}
