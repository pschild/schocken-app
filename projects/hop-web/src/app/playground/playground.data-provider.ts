import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { GameRepository, RoundRepository } from '@hop-backend-api';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PlaygroundDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository
  ) {
  }

  createGameWithRandomRounds(): void {
    const createRound$ = (id: string) => this.roundRepository.create({
      currentPlayerId: '42',
      gameId: id,
      completed: false
    });

    const createGame$ = this.gameRepository.create().pipe(
      switchMap(id => {
        const rounds = [];
        for (let i = 0; i < Math.floor(Math.random() * 50) + 30; i++) {
          rounds.push(createRound$(id));
        }
        return forkJoin(rounds);
      })
    );

    createGame$.subscribe(rounds => console.log(`created a game with ${rounds.length} rounds`));
  }
}
