export class IdbAdapter {

  private static POUCH_DB_DB_PREFIX = '_pouch_';
  private static POUCH_DB_STORE = 'by-sequence';

  private dbName: string;
  private dbInstance: IDBDatabase;

  constructor(dbName: string) {
    this.dbName = dbName;
  }

  async initialize(): Promise<IDBDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }
    return new Promise((resolve, reject) => {
      const request: IDBOpenDBRequest = indexedDB.open(`${IdbAdapter.POUCH_DB_DB_PREFIX}${this.dbName}`);
      request.onsuccess = (event) => {
        // tslint:disable-next-line:no-string-literal
        this.dbInstance = event.target['result'];
        resolve(this.dbInstance);
      };
      request.onerror = (event) => reject(event);
    });
  }

  async getAll(): Promise<any[]> {
    await this.initialize();
    return new Promise((resolve, reject) => {
      const tx = this.dbInstance.transaction(IdbAdapter.POUCH_DB_STORE, 'readonly');
      const store = tx.objectStore(IdbAdapter.POUCH_DB_STORE);
      const request = store.getAll();
      // tslint:disable-next-line:no-string-literal
      request.onsuccess = (event) => resolve(event.target['result']);
      request.onerror = (event) => reject(event);
    });
  }

  async getAllByCriteria(criteria: { [key: string]: string | number; }): Promise<any[]> {
    await this.initialize();
    const allRows = await this.getAll();
    return allRows.filter(row => {
      // tslint:disable-next-line:forin
      for (const key in criteria) {
        return row[key] && row[key] === criteria[key];
      }
    });
  }

}
