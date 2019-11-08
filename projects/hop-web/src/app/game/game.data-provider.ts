import { Injectable } from '@angular/core';
import {
  RoundListItemVo,
  PlayerSelectionVo,
  GameEventListItemVo,
  EventTypeItemVo,
  RoundListItemVoMapperService,
  PlayerSelectVoMapperService,
  GameEventListItemVoMapperService,
  EventTypeItemVoMapperService
} from '@hop-basic-components';
import { Observable } from 'rxjs';
import {
  RoundRepository,
  GameRepository,
  PlayerRepository,
  GameEventRepository,
  EventTypeRepository,
  GameDto,
  RoundDto,
  PlayerDto,
  GameEventDto,
  EventTypeDto,
  EventTypeContext
} from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { GameDetailsVo } from './model/game-details.vo';
import { GameDetailsVoMapperService } from './mapper/game-details-vo-mapper.service';

@Injectable({
  providedIn: 'root'
})
export class GameDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private gameDetailsVoMapperService: GameDetailsVoMapperService,
    private roundListItemVoMapperService: RoundListItemVoMapperService,
    private gameEventListItemVoMapperService: GameEventListItemVoMapperService,
    private playerSelectVoMapperService: PlayerSelectVoMapperService,
    private eventTypeItemVoMapperService: EventTypeItemVoMapperService,
    private sortService: SortService
  ) {
  }

  getGameById(gameId: string): Observable<GameDetailsVo> {
    return this.gameRepository.get(gameId).pipe(
      map((game: GameDto) => this.gameDetailsVoMapperService.mapToVo(game))
    );
  }

  getRoundsByGameId(gameId: string): Observable<RoundListItemVo[]> {
    return this.roundRepository.getRoundsByGameId(gameId).pipe(
      map((roundDtos: RoundDto[]) => roundDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((roundDtos: RoundDto[]) => this.roundListItemVoMapperService.mapToVos(roundDtos))
    );
  }

  getActivePlayers(): Observable<PlayerSelectionVo[]> {
    return this.playerRepository.getAllActive().pipe(
      map((activePlayers: PlayerDto[]) => this.playerSelectVoMapperService.mapToVos(activePlayers))
    );
  }

  getGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<GameEventListItemVo[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId).pipe(
      map((gameEventDtos: GameEventDto[]) => gameEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((gameEventDtos: GameEventDto[]) => this.gameEventListItemVoMapperService.mapToVos(gameEventDtos))
    );
  }

  getGameEventTypes(): Observable<EventTypeItemVo[]> {
    return this.eventTypeRepository.findByContext(EventTypeContext.GAME).pipe(
      map((eventTypes: EventTypeDto[]) => this.eventTypeItemVoMapperService.mapToVos(eventTypes))
    );
  }

  createGameEvent(gameId: string, playerId: string, eventTypeId: string): Observable<string> {
    return this.gameEventRepository.create({ gameId, playerId, eventTypeId });
  }

  removeGameEvent(gameEventId: string): Observable<string> {
    return this.gameEventRepository.removeById(gameEventId);
  }
}
