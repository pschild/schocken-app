import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameDTO, GameRepository, RoundRepository, RoundDTO } from '@hop-backend-api';
import { GameListItemVO, GameListItemVOMapperService } from '@hop-basic-components';
import { map, mergeMap, mergeAll, toArray, filter } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';

@Injectable({
  providedIn: 'root'
})

export class HomeDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameListItemVOMapperService: GameListItemVOMapperService,
    private sortService: SortService
  ) {
  }

  getGameList(): Observable<GameListItemVO[]> {
    return this.gameRepository.getAll().pipe(
      map((games: GameDTO[]) => games.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))), // sort games
      mergeAll(), // transform [GameDTO, GameDTO, ...] to GameDTO, GameDTO, ...
      mergeMap((game: GameDTO) => this.roundRepository.getRoundsByGameId(game._id).pipe(
        filter((rounds: RoundDTO[]) => rounds.length > 0),
        map((rounds: RoundDTO[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))), // sort rounds
        map((rounds: RoundDTO[]) => [game, rounds.length, rounds[0]])
      )),
      map(
        ([game, roundCount, round]: [GameDTO, number, RoundDTO]) => this.gameListItemVOMapperService.mapToVO(game, round._id, roundCount)
      ), // create VOs
      toArray() // transform GameListItemVO, GameListItemVO, ... => [GameListItemVO, GameListItemVO, ...]
    );
  }
}
