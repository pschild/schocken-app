import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameDto, GameRepository, RoundRepository, RoundDto } from '@hop-backend-api';
import { GameListItemVo, GameListItemVoMapperService } from '@hop-basic-components';
import { map, mergeMap, mergeAll, toArray, filter } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';

@Injectable({
  providedIn: 'root'
})

export class HomeDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameListItemVoMapperService: GameListItemVoMapperService,
    private sortService: SortService
  ) {
  }

  getGameList(): Observable<GameListItemVo[]> {
    return this.gameRepository.findAllIncomplete().pipe(
      map((games: GameDto[]) => games.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))), // sort games
      mergeAll(), // transform [GameDto, GameDto, ...] to GameDto, GameDto, ...
      mergeMap((game: GameDto) => this.roundRepository.getRoundsByGameId(game._id).pipe(
        filter((rounds: RoundDto[]) => rounds.length > 0),
        map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))), // sort rounds
        map((rounds: RoundDto[]) => [game, rounds.length, rounds[0]])
      )),
      map(
        ([game, roundCount, round]: [GameDto, number, RoundDto]) => this.gameListItemVoMapperService.mapToVo(game, round._id, roundCount)
      ), // create Vos
      toArray() // transform GameListItemVo, GameListItemVo, ... => [GameListItemVo, GameListItemVo, ...]
    );
  }
}
