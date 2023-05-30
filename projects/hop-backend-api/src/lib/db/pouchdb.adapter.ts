import { Injectable, Inject } from '@angular/core';
import PouchDB from 'pouchdb';
import pouchdbDebug from 'pouchdb-debug';
import { EntityDto, EntityType } from '../entity';
import { PutResponse } from './model/put-response.model';
import { GetResponse } from './model/get-response.model';
import { RemoveResponse } from './model/remove-response.model';
import { ENV } from '../hop-backend-api.module';
import { UUIDUtil } from '../util/uuid.util';

// @see https://www.npmjs.com/package/pouchdb-find
PouchDB.plugin(pouchdbDebug);

@Injectable({
  providedIn: 'root'
})
export class PouchDbAdapter {

  protected instance;

  constructor(@Inject(ENV) private env) { }

  initialize(): void {
    if (this.instance) {
      throw new Error(`PouchDB already initialized`);
    }
    this.instance = new PouchDB(this.env.LOCAL_DATABASE, { auto_compaction: true });
  }

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

  createAll(entities: EntityDto[]): Promise<PutResponse[]> {
    console.log(`%cCREATE_ALL ${entities.map(e => e._id)}`, 'color: #00f');
    return this.instance.bulkDocs(entities);
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

  toRawId(primaryKey: string, entityType: EntityType): string {
    const matches = primaryKey.match(new RegExp(`${entityType}-[a-z0-9-]{8}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{4}-[a-z0-9-]{12}`));
    if (!matches || matches.length === 0) {
      throw new Error(`neee`);
    }
    return matches[0];
  }

  generateId(prefix: string): string {
    return `${prefix}-${UUIDUtil.generate()}`;
  }

  destroy(): Promise<any> {
    return this.instance.destroy();
  }
}
