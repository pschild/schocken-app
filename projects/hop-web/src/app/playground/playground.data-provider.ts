import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { GameRepository, RoundRepository, PlayerRepository, PlayerDTO } from '@hop-backend-api';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PlaygroundDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository
  ) {
  }

  getAllPlayers(): Observable<PlayerDTO[]> {
    return this.playerRepository.getAll();
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

  createPlayer(): void {
    this.playerRepository.create({ name: `gen-player-${Math.floor(Math.random() * 10000) + 1}` });
  }
}
