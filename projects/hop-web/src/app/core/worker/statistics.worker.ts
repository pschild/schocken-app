/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';
import { IdbAdapter } from './idb-adapter';

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
