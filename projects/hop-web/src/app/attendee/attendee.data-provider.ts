import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameRepository, RoundRepository, PlayerRepository, PlayerDto, RoundDto, ParticipationDto } from '@hop-backend-api';
import { SortService, SortDirection } from '../core/service/sort.service';
import { map } from 'rxjs/operators';
import { AttendeeItemVoMapperService } from './mapper/attendee-item-vo-mapper.service';
import { RoundAttendeesVoMapperService } from './mapper/round-attendees-vo-mapper.service';
import { RoundAttendeesVo } from './model/round-attendees.vo';
import { AttendeeItemVo } from './model/attendee-item.vo';

@Injectable({
  providedIn: 'root'
})

export class AttendeeDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private playerRepository: PlayerRepository,
    private roundRepository: RoundRepository,
    private attendeeItemVoMapperService: AttendeeItemVoMapperService,
    private roundAttendeesVoMapperService: RoundAttendeesVoMapperService,
    private sortService: SortService
  ) {
  }

  createRound(gameId: string, currentPlayerId: string, attendeeList: ParticipationDto[]): Observable<string> {
    return this.roundRepository.create({ gameId, currentPlayerId, attendeeList });
  }

  setAttendeesForRound(roundId: string, currentPlayerId: string, attendeeList: ParticipationDto[]): Observable<string> {
    return this.roundRepository.update(roundId, { currentPlayerId, attendeeList });
  }

  getAllPlayers(): Observable<AttendeeItemVo[]> {
    return this.playerRepository.getAllActive().pipe(
      map((players: PlayerDto[]) => players.sort((a, b) => this.sortService.compare(a, b, 'name', SortDirection.ASC))),
      map((players: PlayerDto[]) => this.attendeeItemVoMapperService.mapToVos(players))
    );
  }

  getAttendeesByRoundId(roundId: string): Observable<RoundAttendeesVo> {
    return this.roundRepository.get(roundId).pipe(
      map((round: RoundDto) => this.roundAttendeesVoMapperService.mapToVo(round))
    );
  }
}
