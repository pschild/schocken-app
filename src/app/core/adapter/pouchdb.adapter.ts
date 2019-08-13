import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import { AppConfigProvider } from '../config/app-config.provider';
import { from, forkJoin, Observable } from 'rxjs';
import { Entity } from 'src/app/interfaces';

// @see https://www.npmjs.com/package/pouchdb-find
PouchDB.plugin((PouchDBFind as any).default || PouchDBFind);

export interface GetResponse<E> {
  offset: number;
  total_rows: number;
  rows: Array<{ key: string; id: string; value: string; doc?: E }>;
}

export interface PutResponse {
  ok: boolean;
  id: string;
  rev: string;
}

export interface RemoveResponse {
  ok: boolean;
  id: string;
  rev: string;
}

@Injectable({
  providedIn: 'root'
})
export class PouchDbAdapter {

  private instance;

  constructor(private appConfig: AppConfigProvider) { }

  initialize(): Observable<any> {
    if (this.instance) {
      throw new Error(`PouchDB already initialized`);
    }
    this.instance = new PouchDB(this.appConfig.config.COUCHDB_DATABASE);
    const createRoundIndex = this.instance.createIndex({
      index: {
        fields: ['datetime', 'roundId', 'playerId']
      }
    });
    const createGameIndex = this.instance.createIndex({
      index: {
        fields: ['datetime', 'gameId']
      }
    });
    const createTypeIndex = this.instance.createIndex({
      index: {
        fields: ['datetime', 'type']
      }
    });
    return forkJoin(from(createRoundIndex), from(createGameIndex), from(createTypeIndex));
  }

  createIndex(fields): Promise<any> {
    return this.instance.createIndex({
      index: {
        fields
      }
    });
  }

  create(entity: Entity): Promise<PutResponse> {
    console.log(`%cCREATE ${entity._id}`, 'color: #00f');
    return this.instance.put(entity);
  }

  getAll(key: string): Promise<GetResponse<any>> {
    console.log(`%cGET_ALL ${key}`, 'color: #00f');
    const rand = Math.random();
    console.time(`GET_ALL-${key}-${rand}`);
    return this.instance.allDocs({
      include_docs: true,
      startkey: `${key}-`,
      endkey: `${key}-\ufff0`
    }).then(r => {
      console.timeEnd(`GET_ALL-${key}-${rand}`);
      return r;
    });
  }

  getOne(id: string): Promise<any> {
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

  update(id: string, data: Partial<Entity>): Promise<PutResponse> {
    console.log(`%cUPDATE ${id}`, 'color: #00f');
    return this.instance.get(id)
      .then(doc => {
        return this.instance.put(Object.assign(doc, data));
      })
      .catch(err => {
        throw err;
      });
  }

  remove(doc: Entity): Promise<RemoveResponse> {
    console.log(`%cREMOVE ${doc._id}`, 'color: #00f');
    return this.instance.remove(doc)
      .catch(err => {
        throw err;
      });
  }

  generateId(prefix: string): string {
    return `${prefix}-${this._generateUuid()}`;
  }

  private _generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
