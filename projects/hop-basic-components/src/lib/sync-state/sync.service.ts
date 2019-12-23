import { Injectable, Inject } from '@angular/core';
import PouchDB from 'pouchdb';
import { Subject, Observable } from 'rxjs';
import { ENV } from '@hop-backend-api';

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
  data?: any;
}

interface ChangeData {
  direction: 'push' | 'pull';
  change: { ok: boolean; errors: any[]; docs: any[]; };
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  syncEvent$: Subject<SyncEvent> = new Subject();

  private syncProcess: any;

  private activeFlag = false;
  private changeFlag = false;

  constructor(@Inject(ENV) private env) { }

  get syncState(): Observable<SyncEvent> {
    return this.syncEvent$.asObservable();
  }

  startSync(continuous: boolean = false) {
    this.syncProcess = PouchDB.sync(
      this.env.LOCAL_DATABASE,
      this._buildRemoteDbUrl(),
      { live: continuous, retry: continuous }
    )
      .on('active', () => {
        this.activeFlag = true;
        console.log('replicate resumed (e.g. new changes replicating, user went back online)');
        this.syncEvent$.next({ type: SyncType.ACTIVE, datetime: new Date() });
      })
      .on('change', (info: ChangeData) => {
        this.changeFlag = true;
        console.log('handle change', info);
        console.log(`SYNCED ${info.change.docs.length} doc(s) @ ${new Date()}`);
        this.syncEvent$.next({ type: SyncType.CHANGE, datetime: new Date(), data: info });
      })
      .on('paused', err => {
        // when the state was 'active', but after that it was not 'change', we are offline
        if (this.activeFlag && !this.changeFlag) {
          this.syncEvent$.next({ type: SyncType.ERROR, datetime: new Date(), data: err });
        } else {
          this.syncEvent$.next({ type: SyncType.PAUSED, datetime: new Date(), data: err });
        }
        this.activeFlag = false;
        this.changeFlag = false;
        console.log('replication paused (e.g. replication up to date, user went offline)', err);
      })
      .on('complete', info => {
        console.log('handle complete', info);
        this.syncEvent$.next({ type: SyncType.COMPLETE, datetime: new Date(), data: info });
      })
      .on('denied', err => {
        console.log('a document failed to replicate (e.g. due to permissions)', err);
        this.syncEvent$.next({ type: SyncType.DENIED, datetime: new Date(), data: err });
      })
      .on('error', err => {
        console.log('handle error', err);
        this.syncEvent$.next({ type: SyncType.ERROR, datetime: new Date(), data: err });
      });
  }

  stopSync() {
    this.syncProcess.cancel();
  }

  private _buildRemoteDbUrl() {
    const user = this.env.REMOTE_USER;
    const password = this.env.REMOTE_PASSWORD;
    const remoteUrl = this.env.REMOTE_URL;
    const remoteDbName = this.env.REMOTE_DATABASE;
    return `https://${user}:${password}@${remoteUrl}/${remoteDbName}`;
  }
}
