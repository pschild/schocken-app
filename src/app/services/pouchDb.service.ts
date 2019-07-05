import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import { AppConfigService } from './app-config.service';
import { Entity } from '../interfaces';

// @see https://www.npmjs.com/package/pouchdb-find
PouchDB.plugin((PouchDBFind as any).default || PouchDBFind);

export interface GetResponse<E> {
  offset: number;
  total_rows: number;
  rows: Array<{ key: string; id: string; value: string; doc?: E }>;
}

export interface FindResponse<E> {
  docs: E[];
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
export class PouchDbService {

  private instance;

  constructor(private appConfig: AppConfigService) { }

  initialize() {
    if (this.instance) {
      throw new Error(`PouchDB already initialized`);
    }
    this.instance = new PouchDB(this.appConfig.config.COUCHDB_DATABASE);
    this.instance.createIndex({
      index: {
        fields: ['datetime', 'roundId', 'playerId']
      }
    });
    this.instance.createIndex({
      index: {
        fields: ['datetime', 'gameId']
      }
    });
  }

  createIndex(fields) {
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
    return this.instance.allDocs({
      include_docs: true,
      startkey: `${key}-`,
      endkey: `${key}-\ufff0`
    });
  }

  getOne(id: string): Promise<any> {
    console.log(`%cGET ${id}`, 'color: #00f');
    return this.instance.get(id);
  }

  findWithPlugin(selector, orderBy?: any[]): Promise<any> {
    console.log(`%cFIND WITH PLUGIN ${JSON.stringify(selector)}`, 'color: #00f');
    return this.instance.find({
      selector,
      sort: orderBy
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
