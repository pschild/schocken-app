import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { SyncService, SyncEvent, SyncType } from './sync.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'hop-sync-state',
  templateUrl: './sync-state.component.html',
  styleUrls: ['./sync-state.component.scss']
})
export class SyncStateComponent implements OnInit {

  @ViewChild('syncHistoryDialog', { static: true }) syncHistoryDialog: TemplateRef<any>;

  isSyncing: boolean;

  syncHistory: any[] = [];
  lastSynced: Date;

  constructor(
    private syncService: SyncService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.syncService.syncState.subscribe((event: SyncEvent) => {
      this.syncHistory.push({
        type: event.type,
        datetime: event.datetime,
        direction: event.data ? event.data.direction : null,
        docCount: (event.data && event.data.change) ? event.data.change.docs.length : 0
      });

      if (event.type === SyncType.CHANGE) {
        this.lastSynced = event.datetime;
      }

      this.isSyncing = event.type === SyncType.ACTIVE || event.type === SyncType.CHANGE;
      this.cdr.detectChanges();
    });

    // this.syncService.startSync(true);
  }

  openSyncHistoryDialog(): void {
    this.dialog.open(this.syncHistoryDialog);
  }

  startSync(): void {
    this.syncService.startSync(false);
  }

  pull(): void {
    this.syncService.pull();
  }

  push(): void {
    this.syncService.push();
  }

}
