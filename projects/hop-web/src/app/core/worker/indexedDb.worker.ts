/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerReponse } from './model';

const POUCH_DB_DB_PREFIX = '_pouch_';
const POUCH_DB_STORE = 'by-sequence';

addEventListener('message', async (event: MessageEvent) => {
  const workerMessage = event.data as WorkerMessage;
  if (workerMessage.action === 'countRoundEventTypeById' && workerMessage.payload.eventTypeId) {
    try {
      const roundEventsCount = await countRoundEventTypeById(workerMessage.payload.eventTypeId);
      const response: WorkerReponse = { payload: { eventTypeId: workerMessage.payload.eventTypeId, count: roundEventsCount } };
      postMessage(response);
    } catch (error) {
      const response: WorkerReponse = { error, payload: null };
      postMessage(response);
    }
  }
});

const countRoundEventTypeById = async (eventTypeId: string): Promise<number> => {
  const db: IDBDatabase = await openDb(`${POUCH_DB_DB_PREFIX}${environment.env.LOCAL_DATABASE}`);
  const rows: any[] = await getAll(db, POUCH_DB_STORE);
  return rows
    .filter(row => row.type && row.type === 'ROUND_EVENT' && row.eventTypeId === eventTypeId)
    .length;
};

const openDb = (dbName: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName);
    // tslint:disable-next-line:no-string-literal
    request.onsuccess = (event) => resolve(event.target['result']);
    request.onerror = (event) => reject(event);
  });
};

const getAll = (db: IDBDatabase, storeName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    // tslint:disable-next-line:no-string-literal
    request.onsuccess = (event) => resolve(event.target['result']);
    request.onerror = (event) => reject(event);
  });
};
