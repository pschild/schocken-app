import { Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import {
  GameRepository,
  RoundRepository,
  PlayerRepository,
  EventTypeRepository,
  EventTypeContext,
  RoundEventRepository
} from '@hop-backend-api';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PlaygroundDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundEventRepository: RoundEventRepository
  ) {
  }

  createGameWithRandomRounds(): void {
    const gamesCount = 24;
    const roundsPerGameCount = 30;
    const roundEventsPerPlayerPerRoundCount = 10;

    const createPlayers$ = forkJoin(
      this.playerRepository.create({ name: 'Dummy 1', active: true }),
      this.playerRepository.create({ name: 'Dummy 2', active: true }),
      this.playerRepository.create({ name: 'Dummy 3', active: true }),
      this.playerRepository.create({ name: 'Dummy 4', active: true }),
      this.playerRepository.create({ name: 'Dummy 5', active: true }),
      this.playerRepository.create({ name: 'Dummy 6', active: true })
    );

    const createEventTypes$ = forkJoin(
      this.eventTypeRepository.create({ description: 'RoundEventType 1', context: EventTypeContext.ROUND }),
      this.eventTypeRepository.create({ description: 'RoundEventType 2', context: EventTypeContext.ROUND }),
      this.eventTypeRepository.create({ description: 'RoundEventType 3', context: EventTypeContext.ROUND })
    );

    // tslint:disable-next-line:max-line-length
    const createRound$ = (gameId: string, attendeeList: {playerId: string}[]) => this.roundRepository.create({
      gameId,
      attendeeList
    });

    // tslint:disable-next-line:max-line-length
    const createRoundEvent$ = (roundId: string, playerId: string, eventTypeId: string) => this.roundEventRepository.create({
      roundId,
      playerId,
      eventTypeId
    });

    createPlayers$.pipe(
      switchMap(([...playerIds]) => forkJoin(of(playerIds), createEventTypes$)),
      switchMap(([[...playerIds], [...eventTypeIds]]) => {
        const games = [];
        for (let i = 0; i < gamesCount; i++) {
          games.push(this.gameRepository.create());
        }
        return forkJoin(of(playerIds), of(eventTypeIds), forkJoin(games));
      }),
      switchMap(([[...playerIds], [...eventTypeIds], [...gameIds]]) => {
        const rounds = [];
        for (const gameId of gameIds) {
          for (let i = 0; i < roundsPerGameCount; i++) {
            rounds.push(createRound$(gameId as string, playerIds.map(id => ({playerId: id}))));
          }
        }
        return forkJoin(of(playerIds), of(eventTypeIds), of(gameIds), forkJoin(rounds));
      }),
      switchMap(([[...playerIds], [...eventTypeIds], [...gameIds], [...roundIds]]) => {
        const roundEvents = [];
        for (const roundId of roundIds) {
          for (const playerId of playerIds) {
            for (let i = 0; i < roundEventsPerPlayerPerRoundCount; i++) {
              roundEvents.push(createRoundEvent$(roundId as string, playerId, eventTypeIds[0]));
            }
          }
        }
        return forkJoin(of(playerIds), of(eventTypeIds), of(gameIds), of(roundIds), forkJoin(roundEvents));
      })
    ).subscribe(_ => {
      console.log(_);
      alert('Done.');
    });
  }
}
