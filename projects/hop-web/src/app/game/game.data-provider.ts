import { Injectable } from '@angular/core';
import {
  RoundListItemVO,
  PlayerSelectionVO,
  GameEventListItemVO,
  EventTypeItemVO,
  RoundListItemVOMapperService,
  PlayerSelectVOMapperService,
  GameEventListItemVOMapperService,
  EventTypeItemVOMapperService
} from '@hop-basic-components';
import { Observable } from 'rxjs';
import {
  RoundRepository,
  GameRepository,
  PlayerRepository,
  GameEventRepository,
  EventTypeRepository,
  GameDTO,
  RoundDTO,
  PlayerDTO,
  GameEventDTO,
  EventTypeDTO,
  EventTypeContext
} from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { GameDetailsVO } from './model/game-details.vo';
import { GameDetailsVOMapperService } from './mapper/game-details-vo-mapper.service';

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
    private gameDetailsVOMapperService: GameDetailsVOMapperService,
    private roundListItemVOMapperService: RoundListItemVOMapperService,
    private gameEventListItemVOMapperService: GameEventListItemVOMapperService,
    private playerSelectVOMapperService: PlayerSelectVOMapperService,
    private eventTypeItemVOMapperService: EventTypeItemVOMapperService,
    private sortService: SortService
  ) {
  }

  getGameById(gameId: string): Observable<GameDetailsVO> {
    return this.gameRepository.get(gameId).pipe(
      map((game: GameDTO) => this.gameDetailsVOMapperService.mapToVO(game))
    );
  }

  getRoundsByGameId(gameId: string): Observable<RoundListItemVO[]> {
    return this.roundRepository.getRoundsByGameId(gameId).pipe(
      map((roundDtos: RoundDTO[]) => roundDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((roundDtos: RoundDTO[]) => this.roundListItemVOMapperService.mapToVOs(roundDtos))
    );
  }

  getActivePlayers(): Observable<PlayerSelectionVO[]> {
    return this.playerRepository.getAllActive().pipe(
      map((activePlayers: PlayerDTO[]) => this.playerSelectVOMapperService.mapToVOs(activePlayers))
    );
  }

  getGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<GameEventListItemVO[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId).pipe(
      map((gameEventDtos: GameEventDTO[]) => gameEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((gameEventDtos: GameEventDTO[]) => this.gameEventListItemVOMapperService.mapToVOs(gameEventDtos))
    );
  }

  getGameEventTypes(): Observable<EventTypeItemVO[]> {
    return this.eventTypeRepository.findByContext(EventTypeContext.GAME).pipe(
      map((eventTypes: EventTypeDTO[]) => this.eventTypeItemVOMapperService.mapToVOs(eventTypes))
    );
  }
}
