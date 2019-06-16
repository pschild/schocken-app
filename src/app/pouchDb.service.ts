import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { Entity } from './interfaces';
import { AppConfigService } from './app-config.service';

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
export class PouchDbService {

  private databaseName = 'dummy'
  private instance;

  constructor(private appConfig: AppConfigService) { }

  initialize() {
    if (this.instance) {
      throw new Error(`PouchDB already initialized`);
    }
    this.instance = new PouchDB(this.databaseName);
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

  find(criteria: Array<{ key: string; value: string; }>, orderBy?: Array<string>) {
    console.log(`%cFIND ${JSON.stringify(criteria)}`, 'color: #00f');
    return this.instance.query((doc, emit) => {
      let matches = criteria
        .map(crit => doc[crit.key] === crit.value)
        .every(res => res === true);

      if (matches) {
        if (orderBy) {
          emit(orderBy.map(attr => doc[attr]), null);
        } else {
          emit(doc._id, null);
        }
      }
    }, {
        include_docs: true
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
    return `${prefix}-${this._generateUuid()}`
  }

  private _generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
