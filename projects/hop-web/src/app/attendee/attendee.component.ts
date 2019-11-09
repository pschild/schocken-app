import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AttendeeDataProvider } from './attendee.data-provider';
import { Observable, forkJoin, of, combineLatest } from 'rxjs';
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

  onContinueRoundClick(): void {
    // TODO: move to DP
    this.roundAttendees$.pipe(
      map((roundAttendees: RoundAttendeesVo) => {
        if (this.participatingPlayers.find((player: AttendeeItemVo) => player.id === roundAttendees.currentPlayerId)) {
          return roundAttendees.currentPlayerId;
        }
        return this.participatingPlayers[0].id;
      }),
      withLatestFrom(this.roundId$),
      switchMap(([currentPlayerId, roundId]: [string, string]) => this.dataProvider.setAttendeesForRound(
        roundId,
        currentPlayerId,
        this.participatingPlayers.map((player: AttendeeItemVo) => ({
          playerId: player.id,
          inGameStatus: player.inGameStatus
        }))
      ))
    ).subscribe((updatedRoundId: string) => this.router.navigate(['round', updatedRoundId]));
  }

  onCancelClick(): void {
    this.roundId$.subscribe((roundId: string) => {
      if (roundId) {
        this.router.navigate(['round', roundId]);
      } else {
        this.router.navigate(['home']);
      }
    });
  }

  onStartGameClick(): void {
    // TODO: move to DP
    this.dataProvider.createGame().pipe(
      switchMap((createdGameId: string) => forkJoin(
        of(createdGameId),
        this.dataProvider.createRound(
          createdGameId,
          this.participatingPlayers[0].id,
          this.participatingPlayers.map((player: AttendeeItemVo) => ({
            playerId: player.id,
            inGameStatus: true
          }))
        )
      ))
    ).subscribe(([createdGameId, createdRoundId]: [string, string]) => this.router.navigate(['game', createdGameId]));
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

  // TODO: move to DP
  private _getParticipatingPlayers(allPlayers: AttendeeItemVo[], attendees: ParticipationDto[]): AttendeeItemVo[] {
    const returnValue: AttendeeItemVo[] = [];
    let accordingPlayer: AttendeeItemVo;
    for (const attendee of attendees) {
      accordingPlayer = allPlayers.find((player: AttendeeItemVo) => player.id === attendee.playerId);
      returnValue.push({ id: accordingPlayer.id, name: accordingPlayer.name, inGameStatus: attendee.inGameStatus });
    }
    return returnValue;
  }

  // TODO: move to DP
  private _getNotParticipatingPlayers(allPlayers: AttendeeItemVo[], attendees: ParticipationDto[]): AttendeeItemVo[] {
    return allPlayers
      .filter((player: AttendeeItemVo) => !attendees.find((attendee: ParticipationDto) => attendee.playerId === player.id))
      .map((player: AttendeeItemVo) => ({
        id: player.id,
        name: player.name,
        inGameStatus: false
      }));
  }

}
