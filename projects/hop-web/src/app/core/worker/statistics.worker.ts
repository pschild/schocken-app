/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';
import { IdbAdapter } from './idb-adapter';
import { RoundDto } from '@hop-backend-api/lib/round/model/round.dto';
import { GameDto, GameDtoUtils } from 'projects/hop-backend-api/src/lib/game/model/game.dto';
import { RoundDtoUtils } from 'projects/hop-backend-api/src/lib/round/model/round.dto';
import { EventDto, EventDtoUtils } from 'projects/hop-backend-api/src/lib/event/model/event.dto';
import { maxBy, minBy, orderBy } from 'lodash';
import {
  AttendanceCountItem,
  AttendanceCountPayload,
  GameCountPayload,
  LostCountPayload,
  MaxSchockAusStreakPayload,
  RoundCountPayload,
  SchockAusCountPayload,
  WorkerResponsePayload
} from './model/worker-response';
import { getAllSchockAusEvents, getAllVerlorenEvents, getEventCountByPlayer } from './event.utils';
import { getRoundCountByPlayer } from './attendance.utils';
import { groupRoundsByGame } from './round.utils';
import { parseId } from './utils';

const idbAdapter = new IdbAdapter(environment.env.LOCAL_DATABASE);

addEventListener('message', async (event: MessageEvent) => {
  const workerMessage = event.data as WorkerMessage;
  if (workerMessage.action === WorkerActions.COUNT_GAMES) {
    const games: GameDto[] = await idbAdapter.getAllByCriteria(
      GameDtoUtils.completedBetweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    // console.log(games);
    postMessage(buildSuccessResponse(workerMessage, { count: games.length } as GameCountPayload));
  } else if (workerMessage.action === WorkerActions.COUNT_ROUNDS) {
    const rounds: RoundDto[] = await idbAdapter.getAllByCriteria(
      RoundDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    postMessage(buildSuccessResponse(workerMessage, { count: rounds.length } as RoundCountPayload));
  } else if (workerMessage.action === WorkerActions.GET_ATTENDANCE_COUNT) {
    const rounds: RoundDto[] = await idbAdapter.getAllByCriteria(
      RoundDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    const roundCountByPlayer = getRoundCountByPlayer(workerMessage.payload.players, rounds);
    const attendanceCountItems = roundCountByPlayer.map(roundCountItem => ({
      quote: roundCountItem.roundCount / rounds.length,
      ...roundCountItem
    }) as AttendanceCountItem);
    const ranking = orderBy(attendanceCountItems, ['roundCount', 'name'], 'desc');
    const min = minBy(attendanceCountItems, 'roundCount');
    const max = maxBy(attendanceCountItems, 'roundCount');
    const minAttendance = ranking.filter(item => item.roundCount === min.roundCount);
    const maxAttendance = ranking.filter(item => item.roundCount === max.roundCount);

    // console.log(ranking, maxAttendance, minAttendance);
    postMessage(buildSuccessResponse(workerMessage, { ranking, minAttendance, maxAttendance } as AttendanceCountPayload));
  } else if (workerMessage.action === WorkerActions.GET_LOSE_RATES) {
    const allVerlorenEvents = await getAllVerlorenEvents(idbAdapter, workerMessage.payload.from, workerMessage.payload.to);
    const eventCountByPlayer = getEventCountByPlayer(workerMessage.payload.players, allVerlorenEvents);

    const rounds: RoundDto[] = await idbAdapter.getAllByCriteria(
      RoundDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    const roundCountByPlayer = getRoundCountByPlayer(workerMessage.payload.players, rounds);

    const combined = [];
    for (const i of roundCountByPlayer) {
      const accordingEventCountItem = eventCountByPlayer.find(row => row.playerId === i.playerId);
      combined.push({ ...i, eventCount: accordingEventCountItem ? accordingEventCountItem.eventCount : 0 });
    }
    const withQuote = combined.map(item => ({ ...item, quote: item.eventCount / item.roundCount }));
    const ranking = orderBy(withQuote, ['quote', 'name'], 'desc');
    const minQuote = minBy(withQuote, 'quote');
    const maxQuote = maxBy(withQuote, 'quote');

    // console.log(roundCountByPlayer, eventCountByPlayer, ranking, minQuote, maxQuote);
    postMessage(buildSuccessResponse(workerMessage, { ranking, minQuote, maxQuote } as LostCountPayload));
  } else if (workerMessage.action === WorkerActions.GET_MAX_SCHOCK_AUS_BY_PLAYER) {
    const allSchockAusEvents = await getAllSchockAusEvents(idbAdapter, workerMessage.payload.from, workerMessage.payload.to);
    const eventCountByPlayer = getEventCountByPlayer(workerMessage.payload.players, allSchockAusEvents);

    const rounds: RoundDto[] = await idbAdapter.getAllByCriteria(
      RoundDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    const roundCountByPlayer = getRoundCountByPlayer(workerMessage.payload.players, rounds);

    const combined = [];
    for (const i of roundCountByPlayer) {
      const accordingEventCountItem = eventCountByPlayer.find(row => row.playerId === i.playerId);
      combined.push({ ...i, eventCount: accordingEventCountItem ? accordingEventCountItem.eventCount : 0 });
    }
    const withQuote = combined.map(item => ({ ...item, quote: item.eventCount / item.roundCount }));
    const ranking = orderBy(withQuote, ['quote', 'name'], 'desc');
    const minQuote = minBy(withQuote, 'quote');
    const maxQuote = maxBy(withQuote, 'quote');

    // console.log(roundCountByPlayer, eventCountByPlayer, ranking, minQuote, maxQuote);
    postMessage(buildSuccessResponse(workerMessage, { ranking, minQuote, maxQuote } as SchockAusCountPayload));
  } else if (workerMessage.action === WorkerActions.GET_SCHOCK_AUS_STREAK) {
    const allSchockAusEvents = await getAllSchockAusEvents(idbAdapter, workerMessage.payload.from, workerMessage.payload.to);
    const rounds: RoundDto[] = await idbAdapter.getAllByCriteria(
      RoundDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );
    const roundsByGame = groupRoundsByGame(rounds);

    let overallMaxSchockAusStreak = null;
    for (const game of roundsByGame) {
      let maxStreakForGame = 0;
      let schockAusCounter = 0;
      for (const round of game.rounds) {
        // tslint:disable-next-line:no-string-literal
        const roundId = parseId(round['_doc_id_rev']);
        // multiple Schock-Aus in a single round won't be recognized. To count them, switch to .filter()
        if (!!allSchockAusEvents.find(e => e.roundId === roundId)) {
          schockAusCounter++;
          if (schockAusCounter > maxStreakForGame) {
            maxStreakForGame = schockAusCounter;
          }
        } else {
          schockAusCounter = 0;
        }
      }
      if (!overallMaxSchockAusStreak || overallMaxSchockAusStreak.count < maxStreakForGame) {
        overallMaxSchockAusStreak = { gameId: game.gameId, count: maxStreakForGame };
      }
    }

    const correspondingGame = await idbAdapter.getAllByCriteria(GameDtoUtils.idFilter(overallMaxSchockAusStreak.gameId));
    postMessage(buildSuccessResponse(workerMessage, {
      gameId: overallMaxSchockAusStreak.gameId,
      datetime: correspondingGame[0].datetime,
      count: overallMaxSchockAusStreak.count
    } as MaxSchockAusStreakPayload));
  } else if (workerMessage.action === WorkerActions.COUNT_EVENT_TYPE_BY_ID) {
    const allEvents: EventDto[] = await idbAdapter.getAllByCriteria(
      EventDtoUtils.betweenDatesFilter(workerMessage.payload.from, workerMessage.payload.to)
    );

    // console.log(allEvents.filter(e => e.eventTypeId === workerMessage.payload.eventTypeId));
    postMessage(buildSuccessResponse(workerMessage, {
      eventTypeId: workerMessage.payload.eventTypeId,
      count: allEvents.filter(e => e.eventTypeId === workerMessage.payload.eventTypeId).length
    }));
  }
});

const buildSuccessResponse = (message: WorkerMessage, payload: WorkerResponsePayload): WorkerResponse => {
  return { uuid: message.uuid, payload };
};

const buildErrorResponse = (message: WorkerMessage, error: any): WorkerResponse => {
  return { uuid: message.uuid, error };
};

// const getMaxGameRoundsCount = async (): Promise<number> => {
//   const allRounds: RoundDto[] = await idbAdapter.getAllByCriteria({ type: 'ROUND' });
//   const roundsByGameId = groupBy('gameId')(allRounds);
//   return Math.max(...Object.values(roundsByGameId).map((gameRounds: RoundDto[]) => gameRounds.length));
// };
