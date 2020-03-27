import { Injectable, Inject } from '@angular/core';
import PouchDB from 'pouchdb';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { ENV } from '@hop-backend-api';
import { EventEmitter } from 'events';

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
  changeInfo?: SyncChangeData | ReplicationChangeData;
  completeInfo?: SyncCompleteData | ReplicationCompleteData;
  error?: Error;
}

export interface SyncChangeData {
  direction: 'push' | 'pull';
  change: ReplicationChangeData;
}

export interface SyncCompleteData {
  push: ReplicationCompleteData;
  pull: ReplicationCompleteData;
}

interface ReplicationData {
  ok: boolean;
  docs_read: number;
  docs_written: number;
  errors: any[];
}

export interface ReplicationCompleteData extends ReplicationData {
  status: string;
}

export interface ReplicationChangeData extends ReplicationData {
  docs: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  syncEvent$: Subject<SyncEvent> = new Subject();
  autoSyncEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private syncProcess: any;

  private activeFlag = false;
  private changeFlag = false;

  constructor(@Inject(ENV) private env) {
    this.autoSyncEnabled$.subscribe((enabled: boolean) => {
      if (enabled) {
        this.startSync(true);
      } else {
        this.stopSync();
      }
    });
  }

  get syncState(): Observable<SyncEvent> {
    return this.syncEvent$.asObservable();
  }

  get autoSyncEnabled(): Observable<boolean> {
    return this.autoSyncEnabled$.asObservable();
  }

  attachEventListeners(emitter: EventEmitter): EventEmitter {
    emitter
      .on('active', () => {
        this.activeFlag = true;
        console.log('replicate resumed (e.g. new changes replicating, user went back online)');
        this.syncEvent$.next({ type: SyncType.ACTIVE, datetime: new Date() });
      })
      .on('change', (info: SyncChangeData | ReplicationChangeData) => {
        this.changeFlag = true;
        console.log('handle change', info);
        const docsChanged = (info as SyncChangeData).change?.docs
          ? (info as SyncChangeData).change?.docs.length
          : (info as ReplicationChangeData).docs.length;
        console.log(`SYNCED ${docsChanged} doc(s) @ ${new Date()}`);
        this.syncEvent$.next({ type: SyncType.CHANGE, datetime: new Date(), changeInfo: info });
      })
      .on('paused', err => {
        // when the state was 'active', but after that it was not 'change', we are offline
        if (this.activeFlag && !this.changeFlag) {
          this.syncEvent$.next({ type: SyncType.ERROR, datetime: new Date(), error: err });
        } else {
          this.syncEvent$.next({ type: SyncType.PAUSED, datetime: new Date() });
        }
        this.activeFlag = false;
        this.changeFlag = false;
        console.log('replication paused (e.g. replication up to date, user went offline)', err);
      })
      .on('complete', (info: SyncCompleteData | ReplicationCompleteData) => {
        console.log('handle complete', info);
        this.syncEvent$.next({ type: SyncType.COMPLETE, datetime: new Date(), completeInfo: info });
      })
      .on('denied', err => {
        console.log('a document failed to replicate (e.g. due to permissions)', err);
        this.syncEvent$.next({ type: SyncType.DENIED, datetime: new Date(), error: err });
      })
      .on('error', err => {
        console.log('handle error', err);
        this.syncEvent$.next({ type: SyncType.ERROR, datetime: new Date(), error: err });
      });
    return emitter;
  }

  toggleAutoSync(state: boolean): void {
    this.autoSyncEnabled$.next(state);
  }

  startSync(continuous: boolean = false) {
    this.syncProcess = this.attachEventListeners(PouchDB.sync(
      this.env.LOCAL_DATABASE,
      this._buildRemoteDbUrl(),
      { live: continuous, retry: continuous }
    ));
  }

  stopSync() {
    if (this.syncProcess) {
      this.syncProcess.cancel();
    }
  }

  pull(): void {
    this.attachEventListeners(PouchDB.replicate(this._buildRemoteDbUrl(), this.env.LOCAL_DATABASE));
  }

  push(): void {
    this.attachEventListeners(PouchDB.replicate(this.env.LOCAL_DATABASE, this._buildRemoteDbUrl()));
  }

  private _buildRemoteDbUrl() {
    const user = this.env.REMOTE_USER;
    const password = this.env.REMOTE_PASSWORD;
    const remoteUrl = this.env.REMOTE_URL;
    const remoteDbName = this.env.REMOTE_DATABASE;
    return `https://${user}:${password}@${remoteUrl}/${remoteDbName}`;
  }
}
