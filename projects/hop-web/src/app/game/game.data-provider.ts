import { Injectable } from '@angular/core';
import { RoundListItemVOMapperService, RoundListItemVO, PlayerSelectionVO } from '@hop-basic-components';
import { Observable, of } from 'rxjs';
import { RoundRepository, GameRepository, PlayerRepository, GameDTO, RoundDTO, PlayerDTO } from '@hop-backend-api';
import { map, delay } from 'rxjs/operators';
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
    private gameDetailsVOMapperService: GameDetailsVOMapperService,
    private roundListItemVOMapperService: RoundListItemVOMapperService,
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

  getGameEventsByPlayerAndGame(playerId: string, gameId: string): Observable<any> {
    return of([
      { id: `GAMEEVENT-1`, playerId, gameId },
      { id: `GAMEEVENT-2`, playerId, gameId },
      { id: `GAMEEVENT-3`, playerId, gameId },
      { id: `GAMEEVENT-4`, playerId, gameId },
      { id: `GAMEEVENT-5`, playerId, gameId }
    ]).pipe(delay(600));
  }
}
