/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';
import { IdbAdapter } from './idb-adapter';
import { EventDto, EventDtoUtils } from 'projects/hop-backend-api/src/lib/event/model/event.dto';
import { WorkerResponsePayload } from './model/worker-response';

const idbAdapter = new IdbAdapter(environment.env.LOCAL_DATABASE);

addEventListener('message', async (event: MessageEvent) => {
  const workerMessage = event.data as WorkerMessage;
  if (workerMessage.action === WorkerActions.COUNT_EVENT_TYPE_BY_ID) {
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
