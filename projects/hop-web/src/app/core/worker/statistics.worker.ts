/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';
import { IdbAdapter } from './idb-adapter';

const idbAdapter = new IdbAdapter(environment.env.LOCAL_DATABASE);

addEventListener('message', async (event: MessageEvent) => {
  const workerMessage = event.data as WorkerMessage;
  if (workerMessage.action === WorkerActions.COUNT_EVENT_TYPE_BY_ID && workerMessage.payload.eventTypeId) {
    try {
      const eventsCount = await countEventTypeById(workerMessage.payload.eventTypeId);
      const response: WorkerResponse = {
        action: workerMessage.action,
        payload: { eventTypeId: workerMessage.payload.eventTypeId, count: eventsCount }
      };
      postMessage(response);
    } catch (error) {
      const response: WorkerResponse = { action: workerMessage.action, error, payload: null };
      postMessage(response);
    }
  } else if (workerMessage.action === WorkerActions.COUNT_ROUNDS) {
    const roundsCount = await countRounds();
    postMessage({ action: workerMessage.action, payload: { count: roundsCount } });
  }
});

const countEventTypeById = async (eventTypeId: string): Promise<number> => {
  const events = await idbAdapter.getAllByCriteria({ eventTypeId });
  return events.length;
};

const countRounds = async (): Promise<number> => {
  return (await idbAdapter.getAllByCriteria({ type: 'ROUND' })).length;
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
