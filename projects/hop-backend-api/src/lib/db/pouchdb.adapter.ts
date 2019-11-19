import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import pouchdbDebug from 'pouchdb-debug';
// import { AppConfigProvider } from '../config/app-config.provider';
import { from, Observable, forkJoin, of } from 'rxjs';
import { EntityDto, EntityType } from '../entity';
import { PutResponse } from './model/put-response.model';
import { GetResponse } from './model/get-response.model';
import { RemoveResponse } from './model/remove-response.model';

// @see https://www.npmjs.com/package/pouchdb-find
PouchDB.plugin((PouchDBFind as any).default || PouchDBFind);
PouchDB.plugin(pouchdbDebug);
// PouchDB.debug.enable('pouchdb:find');
// PouchDB.debug.enable('*');

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
    this.instance = new PouchDB(/*this.appConfig.config.COUCHDB_DATABASE*/'dummy', { auto_compaction: true });

    // to find a round or event by its gameId
    /* const findByGameIdIndex = this.instance.createIndex({
      index: {
        fields: ['type', 'gameId']
      }
    }); */

    // to find active players
    /* const findActivePlayersIndex = this.instance.createIndex({
      index: {
        fields: ['type', 'active']
      }
    }); */
    // return forkJoin(from(findByGameIdIndex), from(findActivePlayersIndex));
    return of(42);
  }

  // TODO: Remove!
  getInstance() {
    return this.instance;
  }

  createIndex(fields): Promise<any> {
    return this.instance.createIndex({
      index: {
        fields
      }
    });
  }

  create(entity: EntityDto): Promise<PutResponse> {
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

  update(id: string, data: Partial<EntityDto>): Promise<PutResponse> {
    console.log(`%cUPDATE ${id}`, 'color: #00f');
    return this.instance.get(id)
      .then(doc => {
        return this.instance.put(Object.assign(doc, data));
      });
  }

  remove(doc: EntityDto): Promise<RemoveResponse> {
    console.log(`%cREMOVE ${doc._id}`, 'color: #00f');
    return this.instance.remove(doc);
  }

  extractRawId(primaryKey: string, entityType: EntityType): string {
    console.log(primaryKey, entityType);
    const matches = primaryKey.match(new RegExp(`${entityType}-[a-z0-9-]{8}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{12}`));
    if (!matches || matches.length === 0) {
      throw new Error(`neee`);
    }
    return matches[0];
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
