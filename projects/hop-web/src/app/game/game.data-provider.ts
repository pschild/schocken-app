import { Injectable } from '@angular/core';
import { RoundListItemVOMapperService, RoundListItemVO } from '@hop-basic-components';
import { Observable } from 'rxjs';
import { RoundRepository, GameRepository } from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { GameDTO, RoundDTO } from '@hop-backend-api';
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
}
