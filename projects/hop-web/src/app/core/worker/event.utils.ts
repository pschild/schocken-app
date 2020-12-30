import { countBy, includes } from 'lodash';
import { EventDto } from 'projects/hop-backend-api/src/lib/event/model/event.dto';
import { PlayerDto, PlayerDtoUtils } from 'projects/hop-backend-api/src/lib/player/model/player.dto';
import { RoundEventDto, RoundEventDtoUtils } from 'projects/hop-backend-api/src/lib/round-event/model/round-event.dto';
import { IdbAdapter } from './idb-adapter';

const VERLOREN_EVENT_TYPE_ID = 'EVENT_TYPE__EVENT_TYPE-5fb6b1dd-2d2b-4f5b-b26b-02eb7687475b';
const VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID = 'EVENT_TYPE__EVENT_TYPE-475e9429-222c-4a8f-8f62-013f3d74a17e';
const SCHOCK_AUS_EVENT_TYPE_ID = 'EVENT_TYPE__EVENT_TYPE-5101a0e9-3495-4fce-84c5-510f1a131059';

export const getAllVerlorenEvents = async (idbAdapter: IdbAdapter, from: string, to: string): Promise<RoundEventDto[]> => {
  /* const verlorenEventType: EventTypeDto[] = await idbAdapter.getAllByCriteria(
    row => row.type === EntityType.EVENT_TYPE && row.description === 'Verloren'
  );
  // tslint:disable-next-line:no-string-literal
  const verlorenEventTypeId: string = parseId(verlorenEventType[0]['_doc_id_rev']);

  const verlorenAlleDeckelEventType: EventTypeDto[] = await idbAdapter.getAllByCriteria(
    row => row.type === EntityType.EVENT_TYPE && row.description === 'Verloren mit allen Deckeln'
  );
  // tslint:disable-next-line:no-string-literal
  const verlorenAlleDeckelEventTypeId: string = parseId(verlorenAlleDeckelEventType[0]['_doc_id_rev']); */

  return await (await idbAdapter.getAllByCriteria(RoundEventDtoUtils.betweenDatesFilter(from, to)))
    .filter((event: RoundEventDto) =>
      event.eventTypeId === VERLOREN_EVENT_TYPE_ID
      || event.eventTypeId === VERLOREN_ALLE_DECKEL_EVENT_TYPE_ID
    );
};

export const getAllSchockAusEvents = async (idbAdapter: IdbAdapter, from: string, to: string): Promise<RoundEventDto[]> => {
  /* const schockAusEventType = await idbAdapter.getAllByCriteria(
    row => row.description === 'Schock-Aus'
  );
  // tslint:disable-next-line:no-string-literal
  const verlorenEventTypeId: string = parseId(schockAusEventType[0]['_doc_id_rev']); */

  return await (await idbAdapter.getAllByCriteria(RoundEventDtoUtils.betweenDatesFilter(from, to)))
    .filter((event: RoundEventDto) => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID);
};

interface EventCountItem {
  playerId: string;
  name: string;
  eventCount: number;
}

export const getEventCountByPlayer = (players: PlayerDto[], events: EventDto[]): EventCountItem[] => {
  const countByProp = countBy(events, 'playerId');
  return Object.keys(countByProp)
      .filter(playerId => includes(players.map(player => player._id), playerId))
      .map(playerId => ({ playerId, eventCount: countByProp[playerId] }))
      .map(item => ({
        name: PlayerDtoUtils.findNameById(players, item.playerId),
        ...item
      }));
};
