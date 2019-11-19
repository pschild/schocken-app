import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { GameRepository, RoundRepository, PlayerRepository, GameEventRepository, GameEventDto, PlayerDto, EventTypeRepository, EventTypeContext, RoundEventRepository, PouchDbAdapter } from '@hop-backend-api';
import { switchMap } from 'rxjs/operators';

declare function emit(val: any);
declare function emit(key: any, value: any);

@Injectable({
  providedIn: 'root'
})

export class PlaygroundDataProvider {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private playerRepository: PlayerRepository,
    private eventTypeRepository: EventTypeRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private db: PouchDbAdapter
  ) {
  }

  testPerformanceQuery(gameId) {
    const dbi = this.db.getInstance();
    const ddoc = {
      _id: '_design/by_gameId',
      views: {
        by_gameId: {
          map: ((doc) => {
            if (doc.type === 'ROUND') {
              emit(doc.gameId);
            }
          }).toString()
        }
      }
    };

    const putPromise = new Promise((res, rej) => {
      return dbi.put(ddoc)
        .then(r => {
          console.log(r);
          res(r);
        })
        .catch(e => {
          console.log(e);
          res(null);
        });
    });

    const queryProm = new Promise((res, rej) => {
      console.time('QUERY');
      return dbi.query('by_gameId', {
        include_docs: true,
        key: gameId
      }).then(r => {
        console.log(r);
        console.timeEnd('QUERY');
        res(r);
      });
    });

    Promise.all([putPromise, queryProm]).then(r => {
      console.log(r);
    });
  }

  testPerformanceAllDocs(gameId) {
    const dbi = this.db.getInstance();
    console.log(`ROUND__${gameId}__ROUND-`);
    console.time('ALLDOCS');
    dbi.allDocs({
      include_docs: true,
      // startkey: `ROUND__${gameId}__ROUND-\ufff0`,
      startkey: `ROUND_EVENT__ROUND-\ufff0`,
      // endkey: `ROUND__${gameId}__ROUND-`,
      endkey: `ROUND_EVENT__ROUND-`,
      descending: true
    }).then(r => {
      console.timeEnd('ALLDOCS');
      console.log(r);
    });
  }

  testPerformanceFind(gameId) {
    const dbi = this.db.getInstance();
    console.time('FIND-WITHOUT-INDEX');
    dbi.find({
      selector: {
        type: {$eq: 'ROUND'},
        gameId: {$eq: gameId}
      }
    }).then(r => {
      console.log(r);
      console.timeEnd(`FIND-WITHOUT-INDEX`);
    });

    console.time(`FIND-WITH-INDEX`);
    dbi.createIndex({
      index: {
        fields: ['type', 'gameId']
      }
    }).then(r => {
      return dbi.find({
        selector: {
          type: {$eq: 'ROUND'},
          gameId: {$eq: gameId}
        }
      });
    }).then(r => {
      console.log(r);
      console.timeEnd(`FIND-WITH-INDEX`);
    });
  }

  createDesignDoc(name, mapFunction) {
    const ddoc = {
      _id: '_design/' + name,
      views: { }
    };
    ddoc.views[name] = { map: mapFunction.toString() };
    return ddoc;
  }

  getAllPlayers(): Observable<PlayerDto[]> {
    return this.playerRepository.getAll();
  }

  getAllGameEvents(): Observable<GameEventDto[]> {
    return this.gameEventRepository.getAll();
  }

  createGameWithRandomRounds(): void {
    const gamesCount = 2;
    const roundsPerGameCount = 2;
    const roundEventsPerPlayerPerRoundCount = 2;

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
    const createRound$ = (gameId: string, currentPlayerId: string, attendeeList: {playerId: string, inGameStatus: boolean}[]) => this.roundRepository.create({
      currentPlayerId,
      gameId,
      attendeeList,
      completed: false
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
            rounds.push(createRound$(gameId, playerIds[0], playerIds.map(id => ({playerId: id, inGameStatus: true}))));
          }
        }
        return forkJoin(of(playerIds), of(eventTypeIds), of(gameIds), forkJoin(rounds));
      }),
      switchMap(([[...playerIds], [...eventTypeIds], [...gameIds], [...roundIds]]) => {
        const roundEvents = [];
        for (const roundId of roundIds) {
          for (const playerId of playerIds) {
            for (let i = 0; i < roundEventsPerPlayerPerRoundCount; i++) {
              roundEvents.push(createRoundEvent$(roundId, playerId, eventTypeIds[0]));
            }
          }
        }
        return forkJoin(of(playerIds), of(eventTypeIds), of(gameIds), of(roundIds), forkJoin(roundEvents));
      })
    ).subscribe(_ => {
      console.log(_);
      console.log(_[2][0]);
    });
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
