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

export interface ImportData extends Partial<GameDto> {
  gameEvents: Partial<GameEventDto>[];
  rounds: Array<Partial<RoundDto> & { events: Partial<RoundEventDto>[] }>;
}

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {

  constructor(
    private gameRepository: GameRepository,
    private roundRepository: RoundRepository,
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository
  ) { }

  async exportSelectedGames(selectedGameIds: string[]): Promise<any> {
    const gameById = (gameId: string) => this.gameRepository.get(gameId).toPromise();
    const roundsByGameId = (gameId: string) => this.roundRepository.getRoundsByGameId(gameId).toPromise();
    const roundEventsByRoundId = (roundId: string) => this.roundEventRepository.findByRoundId(roundId).toPromise();
    const gameEventsByGameId = (gameId: string) => this.gameEventRepository.findByGameId(gameId).toPromise();

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
    return result;
  }

  async importJson(uploadedJson: ImportData[]): Promise<any> {
    for (const item of uploadedJson) {
      const dateTimeOfGame = item.datetime;

      // create game
      const createdGameId = await this.gameRepository.create({
        datetime: dateTimeOfGame,
        completed: item.completed
      }).toPromise();

      // create game events
      item.gameEvents.map(async (event: GameEventDto) => {
        await this.gameEventRepository.create({
          datetime: dateTimeOfGame,
          eventTypeId: event.eventTypeId,
          multiplicatorValue: event.multiplicatorValue,
          playerId: event.playerId,
          gameId: createdGameId
        }).toPromise();
      });

      // create rounds
      item.rounds.map(async (round: RoundDto & { events: RoundEventDto[] }) => {
        const createdRoundId = await this.roundRepository.create({
          datetime: dateTimeOfGame,
          attendeeList: round.attendeeList,
          currentPlayerId: round.currentPlayerId,
          gameId: createdGameId
        }).toPromise();

        // create round events
        round.events.map(async (event: RoundEventDto) => {
          this.roundEventRepository.create({
            datetime: dateTimeOfGame,
            eventTypeId: event.eventTypeId,
            multiplicatorValue: event.multiplicatorValue,
            playerId: event.playerId,
            roundId: createdRoundId
          }).toPromise();
        });
      });
    }
  }

}
