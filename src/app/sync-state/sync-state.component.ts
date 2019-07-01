import { Component, OnInit } from '@angular/core';
import { SyncService } from '../sync.service';
import { Observable } from 'rxjs';
import { map, tap, throttleTime, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-sync-state',
  templateUrl: './sync-state.component.html',
  styleUrls: ['./sync-state.component.scss']
})
export class SyncStateComponent implements OnInit {

  syncState$: Observable<string>;
  lastSynced: Date;

  constructor(private syncService: SyncService) { }

  ngOnInit() {
    const localLastSynced = localStorage.getItem('last-synced');
    if (localLastSynced) {
      this.lastSynced = new Date(localLastSynced);
    }

    this.syncState$ = this.syncService.syncEvent$.pipe(
      map(this._mapSyncState),
      tap((syncState) => {
        if (syncState !== 'ERROR') {
          const now = new Date();
          this.lastSynced = now;
          localStorage.setItem('last-synced', now.toISOString());
        }
      })
    );
  }

  private _mapSyncState(syncEvent) {
    switch (syncEvent.type) {
      case 'ACTIVE':
      case 'CHANGE':
        return 'PENDING';
      case 'PAUSED':
      case 'COMPLETE':
        return 'IDLE';
      case 'DENIED':
      case 'ERROR':
        return 'ERROR';
    }
  }

  startSync() {
    this.syncService.startSync();
  }

}
