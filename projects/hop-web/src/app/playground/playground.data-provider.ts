import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { GameRepository, RoundRepository, PlayerRepository, GameEventRepository, GameEventDto, PlayerDto } from '@hop-backend-api';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class PlaygroundDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private gameEventRepository: GameEventRepository
  ) {
  }

  getAllPlayers(): Observable<PlayerDto[]> {
    return this.playerRepository.getAll();
  }

  getAllGameEvents(): Observable<GameEventDto[]> {
    return this.gameEventRepository.getAll();
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

  createGameEvent(): void {
    this.gameEventRepository.create({ gameId: 'GAME-04a60c68-9e44-4722-a31b-112bc265e132', playerId: 'PLAYER-5fd46454-afe6-4da7-9d9d-857e7a3dd2ca', eventTypeId: 'eti1' });
    this.gameEventRepository.create({ gameId: 'GAME-04a60c68-9e44-4722-a31b-112bc265e132', playerId: 'PLAYER-5fd46454-afe6-4da7-9d9d-857e7a3dd2ca', eventTypeId: 'eti2' });
    this.gameEventRepository.create({ gameId: 'GAME-04a60c68-9e44-4722-a31b-112bc265e132', playerId: 'PLAYER-5fd46454-afe6-4da7-9d9d-857e7a3dd2ca', eventTypeId: 'eti3' });

    this.gameEventRepository.create({ gameId: 'GAME-04a60c68-9e44-4722-a31b-112bc265e132', playerId: 'PLAYER-ab9e4675-b33b-4dee-9454-633af4be693d', eventTypeId: 'eti4' });
    this.gameEventRepository.create({ gameId: 'GAME-04a60c68-9e44-4722-a31b-112bc265e132', playerId: 'PLAYER-ab9e4675-b33b-4dee-9454-633af4be693d', eventTypeId: 'eti5' });
  }
}
