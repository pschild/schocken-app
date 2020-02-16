import { Injectable, Inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { GameDto, GameRepository, RoundRepository, RoundDto, ENV, RoundEventRepository, GameEventRepository, RoundEventDto, GameEventDto } from '@hop-backend-api';
import { map, mergeMap, mergeAll, toArray, switchMap } from 'rxjs/operators';
import { SortService, SortDirection } from '../core/service/sort.service';
import { GameSelectItemVoMapperService } from './mapper';
import { GameSelectItemVo } from './model';

@Injectable({
  providedIn: 'root'
})

export class AdministrationDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private gameSelectItemVoMapperService: GameSelectItemVoMapperService,
    private sortService: SortService,
    @Inject(ENV) private env
  ) {
  }

  getGameList(): Observable<GameSelectItemVo[]> {
    return this.gameRepository.getAll().pipe(
      map((games: GameDto[]) => games.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
      mergeAll(),
      mergeMap((game: GameDto) => this.roundRepository.getRoundsByGameId(game._id).pipe(
        map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.DESC))),
        map((rounds: RoundDto[]) => [game, rounds.length, rounds[0] || null])
      )),
      map(
        ([game, roundCount, round]: [GameDto, number, RoundDto]) => {
          return this.gameSelectItemVoMapperService.mapToVo(game, roundCount);
        }
      ),
      toArray()
    );
  }

  async removeGame(gameId: string): Promise<number[]> {
    const removedGameEventIds: string[] = await this.gameEventRepository.findByGameId(gameId).pipe(
      mergeAll(),
      mergeMap((gameEvent: GameEventDto) => this.gameEventRepository.remove(gameEvent)),
      toArray()
    ).toPromise();

    const removedRoundEventIds: string[] = await this.roundRepository.getRoundsByGameId(gameId).pipe(
      mergeAll(),
      mergeMap((round: RoundDto) => this.roundEventRepository.findByRoundId(round._id)),
      mergeAll(),
      mergeMap((roundEvent: RoundEventDto) => this.roundEventRepository.remove(roundEvent)),
      toArray()
    ).toPromise();

    const removedRoundIds: string[] = await this.roundRepository.getRoundsByGameId(gameId).pipe(
      mergeAll(),
      mergeMap((round: RoundDto) => this.roundRepository.remove(round)),
      toArray()
    ).toPromise();

    const removedGameId: string = await this.gameRepository.get(gameId).pipe(
      switchMap((game: GameDto) => this.gameRepository.remove(game))
    ).toPromise();

    return [removedRoundIds.length, removedGameEventIds.length, removedRoundEventIds.length];
  }

  deleteLocalDatabase(): void {
    const req: IDBOpenDBRequest = window.indexedDB.deleteDatabase(`_pouch_${this.env.LOCAL_DATABASE}`);
    req.onsuccess = () => {
      alert('Deleted database successfully');
      window.location.reload();
    };
    req.onerror = (event) => {
      alert('Could not delete database');
      console.log(event);
    };
    req.onblocked = (event) => {
      alert('Could not delete database due to the operation being blocked');
      console.log(event);
    }
  }
}
