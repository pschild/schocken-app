/// <reference lib="webworker" />
import { environment } from '../../../environments/environment';
import { WorkerMessage, WorkerResponse, WorkerActions } from './model';

const POUCH_DB_DB_PREFIX = '_pouch_';
const POUCH_DB_STORE = 'by-sequence';

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
  const db: IDBDatabase = await openDb(`${POUCH_DB_DB_PREFIX}${environment.env.LOCAL_DATABASE}`);
  const rows: any[] = await getAll(db, POUCH_DB_STORE);
  return rows
    .filter(row =>
      row.type
      && (row.type === 'ROUND_EVENT' || row.type === 'GAME_EVENT')
      && row.eventTypeId === eventTypeId
    )
    .length;
};

const countRounds = async (): Promise<number> => {
  const db: IDBDatabase = await openDb(`${POUCH_DB_DB_PREFIX}${environment.env.LOCAL_DATABASE}`);
  const rows: any[] = await getAll(db, POUCH_DB_STORE);
  const rounds = rows.filter(row => row.type && row.type === 'ROUND');
  return rounds.length;
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

const compare = (a: any, b: any, propName: string, direction: number) => {
  if (a[propName] > b[propName]) {
    return direction === 1 ? 1 : -1;
  }
  if (a[propName] < b[propName]) {
    return direction === 1 ? -1 : 1;
  }
  return 0;
};
