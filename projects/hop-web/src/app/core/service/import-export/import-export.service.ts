import { Injectable } from '@angular/core';
import {
  GameDto,
  GameRepository,
  RoundRepository,
  RoundDto,
  RoundEventRepository,
  GameEventRepository,
  RoundEventDto,
  GameEventDto
} from '@hop-backend-api';
import { SortService, SortDirection } from '../sort.service';
import { map } from 'rxjs/operators';

export interface ImportData extends Partial<GameDto> {
  gameEvents: Partial<GameEventDto>[];
  rounds: Array<Partial<RoundDto> & { events: Partial<RoundEventDto>[] }>;
}

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  private datetimeCache: Date;

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private sortService: SortService
  ) { }

  async exportSelectedGames(selectedGameIds: string[]): Promise<any> {
    const gameById = (gameId: string) => this.gameRepository.get(gameId).toPromise();
    const roundsByGameId = (gameId: string) => this.roundRepository.getRoundsByGameId(gameId).pipe(
      map((rounds: RoundDto[]) => rounds.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    ).toPromise();
    const roundEventsByRoundId = (roundId: string) => this.roundEventRepository.findByRoundId(roundId).pipe(
      map((events: RoundEventDto[]) => events.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    ).toPromise();
    const gameEventsByGameId = (gameId: string) => this.gameEventRepository.findByGameId(gameId).pipe(
      map((events: GameEventDto[]) => events.sort((a, b) => this.sortService.compare(a, b, 'datetime', SortDirection.ASC)))
    ).toPromise();

    const roundsWithEvents = async (gameId: string) => {
      const gameRounds = await roundsByGameId(gameId);
      return Promise.all(gameRounds.map(async (round) => {
        const events = await roundEventsByRoundId(round._id);
        return { ...round, events };
      }));
    };

    const getWholeGameData = async (gameId: string) => {
      const game = await gameById(gameId);
      const rounds = await roundsWithEvents(gameId);
      const gameEvents = await gameEventsByGameId(gameId);
      return {
        ...game,
        rounds,
        gameEvents
      };
    };

    const result = await Promise.all(selectedGameIds.map(id => getWholeGameData(id)));
    this.removeKeys(result, ['_id', '_rev', 'gameId', 'roundId']);
    return result;
  }

  async importJson(uploadedJson: ImportData[]): Promise<any> {
    for (const item of uploadedJson) {
      this.datetimeCache = new Date(item.datetime);

      // create game
      const createdGameId = await this.gameRepository.create({
        datetime: this.increaseAndGetDatetimeCache(),
        place: item.place,
        completed: item.completed
      }).toPromise();

      // create game events
      item.gameEvents.map(async (event: GameEventDto) => {
        await this.gameEventRepository.create({
          datetime: this.increaseAndGetDatetimeCache(),
          eventTypeId: event.eventTypeId,
          multiplicatorValue: event.multiplicatorValue,
          playerId: event.playerId,
          gameId: createdGameId
        }).toPromise();
      });

      // create rounds
      item.rounds.map(async (round: RoundDto & { events: RoundEventDto[] }) => {
        const createdRoundId = await this.roundRepository.create({
          datetime: this.increaseAndGetDatetimeCache(),
          attendeeList: round.attendeeList,
          gameId: createdGameId
        }).toPromise();

        // create round events
        round.events.map(async (event: RoundEventDto) => {
          this.roundEventRepository.create({
            datetime: this.increaseAndGetDatetimeCache(),
            eventTypeId: event.eventTypeId,
            multiplicatorValue: event.multiplicatorValue,
            playerId: event.playerId,
            roundId: createdRoundId
          }).toPromise();
        });
      });
    }
  }

  private removeKeys(obj: any, keys: string[]): any {
    let index;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        switch (typeof (obj[prop])) {
          case 'string':
            index = keys.indexOf(prop);
            if (index > -1) {
              delete obj[prop];
            }
            break;
          case 'object':
            index = keys.indexOf(prop);
            if (index > -1) {
              delete obj[prop];
            } else {
              this.removeKeys(obj[prop], keys);
            }
            break;
        }
      }
    }
  }

  private increaseAndGetDatetimeCache(): Date {
    this.datetimeCache = new Date(this.datetimeCache.getTime() + 1 * 1000);
    return this.datetimeCache;
  }

}
