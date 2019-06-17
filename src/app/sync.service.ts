import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  syncEvent$: Subject<any> = new Subject();

  private syncProcess: any;

  private activeFlag = false;
  private changeFlag = false;

  constructor(private appConfig: AppConfigService) { }

  startSync(continuous: boolean = false) {
    this.syncProcess = PouchDB.sync(
      this.appConfig.config.COUCHDB_DATABASE,
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
        this.syncEvent$.next({ type: 'CHANGE', data: info });
      })
      .on('paused', err => {
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
    const user = this.appConfig.config.COUCHDB_USER;
    const password = this.appConfig.config.COUCHDB_PASSWORD;
    const remoteUrl = this.appConfig.config.COUCHDB_URL;
    const remoteDbName = this.appConfig.config.COUCHDB_DATABASE;
    return `https://${user}:${password}@${remoteUrl}/${remoteDbName}`;
  }
}
