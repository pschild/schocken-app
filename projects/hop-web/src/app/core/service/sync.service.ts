import { Injectable, Inject } from '@angular/core';
import PouchDB from 'pouchdb';
import { Subject } from 'rxjs';
import { DB_CONFIG } from '@hop-backend-api';

export enum SyncType {
  ACTIVE = 'active',
  CHANGE = 'change',
  PAUSED = 'paused',
  COMPLETE = 'complete',
  DENIED = 'denied',
  ERROR = 'error'
}

export interface SyncEvent {
  type: SyncType;
  datetime: Date;
  docCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  syncEvent$: Subject<any> = new Subject();

  private syncProcess: any;

  private activeFlag = false;
  private changeFlag = false;

  constructor(@Inject(DB_CONFIG) private dbConfig) { }

  startSync(continuous: boolean = false) {
    this.syncProcess = PouchDB.sync(
      this.dbConfig.LOCAL_DATABASE,
      this._buildRemoteDbUrl(),
      { live: continuous, retry: continuous }
    )
      .on('active', () => {
        this.activeFlag = true;
        console.log('replicate resumed (e.g. new changes replicating, user went back online)');
        this.syncEvent$.next({ type: 'ACTIVE' });
      })
      .on('change', info => {
        this.changeFlag = true;
        console.log('handle change', info);
        console.log(`SYNCED ${info.change.docs.length} doc(s) @ ${new Date()}`);
        this.syncEvent$.next({ type: 'CHANGE', data: info });
      })
      .on('paused', err => {
        // when the state was 'active', but after that it was not 'change', we are offline
        if (this.activeFlag && !this.changeFlag) {
          this.syncEvent$.next({ type: 'ERROR', data: err });
        } else {
          this.syncEvent$.next({ type: 'PAUSED', data: err });
        }
        this.activeFlag = false;
        this.changeFlag = false;
        console.log('replication paused (e.g. replication up to date, user went offline)', err);
      })
      .on('complete', info => {
        console.log('handle complete', info);
        this.syncEvent$.next({ type: 'COMPLETE', data: info });
      })
      .on('denied', err => {
        console.log('a document failed to replicate (e.g. due to permissions)', err);
        this.syncEvent$.next({ type: 'DENIED', data: err });
      })
      .on('error', err => {
        console.log('handle error', err);
        this.syncEvent$.next({ type: 'ERROR', data: err });
      });
  }

  stopSync() {
    this.syncProcess.cancel();
  }

  private _buildRemoteDbUrl() {
    const user = this.dbConfig.REMOTE_USER;
    const password = this.dbConfig.REMOTE_PASSWORD;
    const remoteUrl = this.dbConfig.REMOTE_URL;
    const remoteDbName = this.dbConfig.REMOTE_DATABASE;
    return `https://${user}:${password}@${remoteUrl}/${remoteDbName}`;
  }
}
