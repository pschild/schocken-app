import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
// import { AppConfigProvider } from '../config/app-config.provider';
import { from, Observable, forkJoin } from 'rxjs';
import { EntityDTO } from '../entity';
import { PutResponse } from './model/put-response.model';
import { GetResponse } from './model/get-response.model';
import { RemoveResponse } from './model/remove-response.model';

// @see https://www.npmjs.com/package/pouchdb-find
PouchDB.plugin((PouchDBFind as any).default || PouchDBFind);

@Injectable({
  providedIn: 'root'
})
export class PouchDbAdapter {

  private instance;

  constructor(/*private appConfig: AppConfigProvider*/) { }

  initialize(): Observable<any> {
    if (this.instance) {
      throw new Error(`PouchDB already initialized`);
    }
    this.instance = new PouchDB(/*this.appConfig.config.COUCHDB_DATABASE*/'dummy');

    // to find a round by its gameId
    const findByGameIdIndex = this.instance.createIndex({
      index: {
        fields: ['gameId']
      }
    });
    return forkJoin(from(findByGameIdIndex));
  }

  createIndex(fields): Promise<any> {
    return this.instance.createIndex({
      index: {
        fields
      }
    });
  }

  create(entity: EntityDTO): Promise<PutResponse> {
    console.log(`%cCREATE ${entity._id}`, 'color: #00f');
    return this.instance.put(entity);
  }

  getAll<T>(key: string): Promise<GetResponse<T>> {
    console.log(`%cGET_ALL ${key}`, 'color: #00f');
    const rand = Math.random();
    console.time(`GET_ALL-${key}-${rand}`);
    return this.instance.allDocs({
      include_docs: true,
      startkey: `${key}-`,
      endkey: `${key}-\ufff0`
    }).then((response: GetResponse<T>) => {
      console.timeEnd(`GET_ALL-${key}-${rand}`);
      return response;
    });
  }

  getOne<T>(id: string): Promise<T> {
    console.log(`%cGET ${id}`, 'color: #00f');
    return this.instance.get(id);
  }

  /**
   * @deprecated
   */
  find(selector, orderBy?: any[]): Promise<any> {
    console.log(`%cFIND ${JSON.stringify(selector)}`, 'color: #00f');
    const rand = Math.random();
    console.time(`FIND-${JSON.stringify(selector)}-${rand}`);
    return this.instance.find({
      selector,
      sort: orderBy
    }).then(r => {
      console.timeEnd(`FIND-${JSON.stringify(selector)}-${rand}`);
      return r;
    });
  }

  update(id: string, data: Partial<EntityDTO>): Promise<PutResponse> {
    console.log(`%cUPDATE ${id}`, 'color: #00f');
    return this.instance.get(id)
      .then(doc => {
        return this.instance.put(Object.assign(doc, data));
      });
  }

  remove(doc: EntityDTO): Promise<RemoveResponse> {
    console.log(`%cREMOVE ${doc._id}`, 'color: #00f');
    return this.instance.remove(doc);
  }

  generateId(prefix: string): string {
    return `${prefix}-${this._generateUuid()}`;
  }

  private _generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line:no-bitwise
      // tslint:disable-next-line:one-variable-per-declaration
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
