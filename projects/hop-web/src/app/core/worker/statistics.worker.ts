/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';
import { IdbAdapter } from './idb-adapter';
import { RoundDto } from '@hop-backend-api/lib/round/model/round.dto';
import { ParticipationDto } from 'projects/hop-backend-api/src/lib/round/model/participation.dto';
import { PlayerDto } from 'projects/hop-backend-api/src/lib/player/model/player.dto';
import { EventTypeDto } from 'projects/hop-backend-api/src/lib/event-type/model/event-type.dto';
import { RoundEventDto } from 'projects/hop-backend-api/src/lib/round-event/model/round-event.dto';

const idbAdapter = new IdbAdapter(environment.env.LOCAL_DATABASE);

addEventListener('message', async (event: MessageEvent) => {
  const workerMessage = event.data as WorkerMessage;
  if (workerMessage.action === WorkerActions.COUNT_EVENT_TYPE_BY_ID && workerMessage.payload.eventTypeId) {
    try {
      postMessage(buildSuccessResponse(workerMessage, {
        eventTypeId: workerMessage.payload.eventTypeId,
        count: await countEventTypeById(workerMessage.payload.eventTypeId)
      }));
    } catch (error) {
      postMessage(buildErrorResponse(workerMessage, error));
    }
  } else if (workerMessage.action === WorkerActions.COUNT_ROUNDS) {
    postMessage(buildSuccessResponse(workerMessage, { count: await countRounds() }));
  } else if (workerMessage.action === WorkerActions.COUNT_GAMES) {
    postMessage(buildSuccessResponse(workerMessage, { count: await countGames() }));
  } else if (workerMessage.action === WorkerActions.GET_MAX_ROUND_COUNT) {
    postMessage(buildSuccessResponse(workerMessage, { count: await getMaxGameRoundsCount() }));
  } else if (workerMessage.action === WorkerActions.GET_ATENDANCE_COUNT) {
    postMessage(buildSuccessResponse(workerMessage, await getAttendanceCount(workerMessage.payload.players)));
  } else if (workerMessage.action === WorkerActions.GET_SCHOCK_AUS_STREAK) {
    postMessage(buildSuccessResponse(workerMessage, await getSchockAusStreak()));
  } else if (workerMessage.action === WorkerActions.GET_MAX_SCHOCK_AUS_BY_PLAYER) {
    postMessage(buildSuccessResponse(workerMessage, await getMaxSchockAusByPlayer(workerMessage.payload.players)));
  } else if (workerMessage.action === WorkerActions.GET_LOSE_RATES) {
    postMessage(buildSuccessResponse(workerMessage, await getLoseRates(workerMessage.payload.players)));
  }
});

const buildSuccessResponse = (message: WorkerMessage, payload: any): WorkerResponse => {
  return { uuid: message.uuid, payload };
};

const buildErrorResponse = (message: WorkerMessage, error: any): WorkerResponse => {
  return { uuid: message.uuid, error };
};

const countEventTypeById = async (eventTypeId: string): Promise<number> => {
  const events = await idbAdapter.getAllByCriteria({ eventTypeId });
  return events.length;
};

const countGames = async (): Promise<number> => {
  return (await idbAdapter.getAllByCriteria({ type: 'GAME' })).length;
};

const countRounds = async (): Promise<number> => {
  return (await idbAdapter.getAllByCriteria({ type: 'ROUND' })).length;
};

const getMaxGameRoundsCount = async (): Promise<number> => {
  const allRounds: RoundDto[] = await idbAdapter.getAllByCriteria({ type: 'ROUND' });
  const roundsByGameId = groupBy('gameId')(allRounds);
  return Math.max(...Object.values(roundsByGameId).map((gameRounds: RoundDto[]) => gameRounds.length));
};

const getAttendanceCount = async (players: PlayerDto[]): Promise<{max: any; min: any}> => {
  const getPlayerNameById = (id: string) => players.find(p => p._id === id).name;
  const participationByPlayerId = await getAttendedRoundsByPlayerId();

  const max = { count: -Infinity, playerName: undefined };
  const min = { count: Infinity, playerName: undefined };
  for (const player of players) {
    if (participationByPlayerId[player._id]) {
      const count = participationByPlayerId[player._id].length;

      if (count > max.count) {
        max.count = count;
        max.playerName = getPlayerNameById(player._id);
      } else if (count < min.count) {
        min.count = count;
        min.playerName = getPlayerNameById(player._id);
      }
    }
  }
  return { min, max };
};

const getSchockAusStreak = async (): Promise<{ gameId: string; schockAusCount: number }> => {
  const allSchockAusEvents: RoundEventDto[] = await getAllSchockAusEvents();

  const allRounds: RoundDto[] = await idbAdapter.getAllByCriteria({ type: 'ROUND' });
  const roundsByGameId = groupBy('gameId')(allRounds);
  const schockAusCountPerGame = [];
  for (const [gameId, rounds] of Object.entries(roundsByGameId)) {
    const sortedRounds: RoundDto[] = (rounds as RoundDto[]).sort((a, b) => compare(a, b, 'datetime', 1));
    let schockAusCounter = 0;
    let maxSchockAusStreak = -Infinity;
    for (const round of sortedRounds) {
      // tslint:disable-next-line:no-string-literal
      const roundId: string = parseId(round['_doc_id_rev']);
      const roundHasSchockAus: boolean = !!allSchockAusEvents.find(e => e.roundId === roundId);
      if (roundHasSchockAus) {
        schockAusCounter++;
        if (schockAusCounter > maxSchockAusStreak) {
          maxSchockAusStreak = schockAusCounter;
        }
      } else {
        schockAusCounter = 0;
      }
    }
    schockAusCountPerGame.push({ gameId, schockAusCount: maxSchockAusStreak });
  }

  return findMaxByKey(schockAusCountPerGame, 'schockAusCount');
};

const getMaxSchockAusByPlayer = async (players: PlayerDto[]): Promise<{ playerName: string; schockAusCount: number }> => {
  const getPlayerNameById = (id: string) => players.find(p => p._id === id).name;

  const allSchockAusEvents: RoundEventDto[] = await getAllSchockAusEvents();
  const schockAusEventsByPlayerId = groupBy('playerId')(allSchockAusEvents);

  let playerName: string;
  let max = -Infinity;
  for (const player of players) {
    if (schockAusEventsByPlayerId[player._id]) {
      const count = schockAusEventsByPlayerId[player._id].length;
      if (count > max) {
        max = count;
        playerName = getPlayerNameById(player._id);
      }
    }
  }
  return { playerName, schockAusCount: max };
};

const getLoseRates = async (players: PlayerDto[]): Promise<{max: any, min: any}> => {
  const getPlayerNameById = (id: string) => players.find(p => p._id === id).name;

  const participationByPlayerId = await getAttendedRoundsByPlayerId();
  const allVerlorenEvents: RoundEventDto[] = await getAllVerlorenEvents();
  const verlorenEventsByPlayerId = groupBy('playerId')(allVerlorenEvents);

  const max = { rate: -Infinity, playerName: undefined };
  const min = { rate: Infinity, playerName: undefined };
  for (const player of players) {
    if (participationByPlayerId[player._id]) {
      const attendedRounds = participationByPlayerId[player._id].length;
      const lostRounds = verlorenEventsByPlayerId[player._id] ? verlorenEventsByPlayerId[player._id].length : 0;
      const rate = lostRounds / attendedRounds;

      if (rate > max.rate) {
        max.rate = rate;
        max.playerName = getPlayerNameById(player._id);
      } else if (rate < min.rate) {
        min.rate = rate;
        min.playerName = getPlayerNameById(player._id);
      }
    }
  }

  return { min, max };
};

/* DRY */
const getAttendedRoundsByPlayerId = async (): Promise<{ [playerId: string]: ParticipationDto[] }> => {
  const allRounds: RoundDto[] = await idbAdapter.getAllByCriteria({ type: 'ROUND' });
  const participations: ParticipationDto[][] = allRounds.map((round: RoundDto) => round.attendeeList);
  const mergedParticipations: ParticipationDto[] = [].concat.apply([], participations);
  return groupBy('playerId')(mergedParticipations);
};

const getAllSchockAusEvents = async (): Promise<RoundEventDto[]> => {
  const schockAusEventType: EventTypeDto[] = await idbAdapter.getAllByCriteria({ trigger: 'SCHOCK_AUS' });
  // tslint:disable-next-line:no-string-literal
  const schockAusEventTypeId: string = parseId(schockAusEventType[0]['_doc_id_rev']);
  return await idbAdapter.getAllByCriteria({ eventTypeId: schockAusEventTypeId });
};

const getAllVerlorenEvents = async (): Promise<RoundEventDto[]> => {
  // TODO: use _id?
  const verlorenEventType: EventTypeDto[] = await idbAdapter.getAllByCriteria({ description: 'Verloren' });
  // tslint:disable-next-line:no-string-literal
  const verlorenEventTypeId: string = parseId(verlorenEventType[0]['_doc_id_rev']);

  const verlorenAlleDeckelEventType: EventTypeDto[] = await idbAdapter.getAllByCriteria({ description: 'Verloren mit allen Deckeln' });
  // tslint:disable-next-line:no-string-literal
  const verlorenAlleDeckelEventTypeId: string = parseId(verlorenAlleDeckelEventType[0]['_doc_id_rev']);

  const verlorenEvents: RoundEventDto[] = await idbAdapter.getAllByCriteria({ eventTypeId: verlorenEventTypeId });
  const verlorenAlleDeckelEvents: RoundEventDto[] = await idbAdapter.getAllByCriteria({ eventTypeId: verlorenAlleDeckelEventTypeId });

  return [...verlorenEvents, ...verlorenAlleDeckelEvents];
};

/* UTILS */
const parseId = (idWithRev: string): string => {
  return idWithRev.split('::')[0];
};

const compare = (a: any, b: any, propName: string, direction: number) => {
  if (a[propName] > b[propName]) {
    return direction === 1 ? 1 : -1;
  }
  if (a[propName] < b[propName]) {
    return direction === 1 ? -1 : 1;
  }
  return 0;
};

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});

const findMaxByKey = (arr: any[], key: string) => {
  return arr.reduce((prev, current) => (prev[key] > current[key]) ? prev : current);
};
