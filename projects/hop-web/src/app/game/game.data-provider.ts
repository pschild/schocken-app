import { Injectable } from '@angular/core';
import { RoundListItemVOMapperService, RoundListItemVO, PlayerSelectionVO, GameEventListItemVO, GameEventListItemVOMapperService } from '@hop-basic-components';
import { Observable } from 'rxjs';
import { RoundRepository, GameRepository, PlayerRepository, GameEventRepository, GameDTO, RoundDTO, PlayerDTO, GameEventDTO } from '@hop-backend-api';
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
    private gameDetailsVOMapperService: GameDetailsVOMapperService,
    private roundListItemVOMapperService: RoundListItemVOMapperService,
    private gameEventListItemVOMapperService: GameEventListItemVOMapperService,
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
      map((activePlayers: PlayerDTO[]) => activePlayers.map((player: PlayerDTO) => ({
        id: player._id,
        name: player.name
      })))
    );
  }

  getGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<GameEventListItemVO[]> {
    return this.gameEventRepository.findByPlayerIdAndGameId(playerId, gameId).pipe(
      map((gameEventDtos: GameEventDTO[]) => gameEventDtos.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      map((gameEventDtos: GameEventDTO[]) => this.gameEventListItemVOMapperService.mapToVOs(gameEventDtos))
    );
  }
}
