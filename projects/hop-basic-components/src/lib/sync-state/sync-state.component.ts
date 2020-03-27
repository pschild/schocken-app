import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { SyncService, SyncEvent, SyncType } from './sync.service';
import { MatDialog } from '@angular/material/dialog';
import { interval } from 'rxjs';

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
      if (event.changeInfo) {
        if ('direction' in event.changeInfo) { // sync
          this.pushHistory(event, event.changeInfo.direction, event.changeInfo.change.docs.length);
        } else if ('ok' in event.changeInfo) { // replication
          this.pushHistory(event, '', event.changeInfo.docs.length);
        }
      } else if (event.completeInfo) {
        if ('push' in event.completeInfo) { // sync
          this.pushHistory(event, 'push', `${event.completeInfo.push.docs_read}r / ${event.completeInfo.push.docs_written}w`);
          this.pushHistory(event, 'pull', `${event.completeInfo.pull.docs_read}r / ${event.completeInfo.pull.docs_written}w`);
        } else if ('ok' in event.completeInfo) { // replication
          this.pushHistory(event, '', `${event.completeInfo.docs_read}r / ${event.completeInfo.docs_written}w`);
        }
      }

      if (event.type === SyncType.CHANGE) {
        this.lastSynced = event.datetime;
      }

      this.isSyncing = event.type === SyncType.ACTIVE || event.type === SyncType.CHANGE;
      this.cdr.detectChanges();
    });

    // start live auto sync when app is started
    // this.syncService.startSync(true);

    // start single sync in intervals when app is started
    // interval(10 * 1000).subscribe(_ => {
    //   this.syncService.startSync(false);
    // });
  }

  private pushHistory(event: SyncEvent, direction: string, docCount: any): void {
    this.syncHistory.push({
      type: event.type,
      datetime: event.datetime,
      direction,
      docCount
    });
  }

  openSyncHistoryDialog(): void {
    this.dialog.open(this.syncHistoryDialog);
  }

}
