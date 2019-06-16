import { Component, OnInit } from '@angular/core';
import { PouchDbService } from '../pouchDb.service';

@Component({
  selector: 'app-sync-state',
  templateUrl: './sync-state.component.html',
  styleUrls: ['./sync-state.component.scss']
})
export class SyncStateComponent implements OnInit {

  syncState: string;
  lastSynced: Date;

  constructor(private pouchDbService: PouchDbService) { }

  ngOnInit() {
    this.pouchDbService.syncEvent$.subscribe(event => {
      if (event.type === 'START') {
        this.syncState = 'SYNCING';
      } else if (event.type === 'CHANGE') {

      } else if (event.type === 'COMPLETE') {
        this.syncState = undefined;
        this.lastSynced = new Date();
      } else if (event.type === 'ERROR') {
        this.syncState = 'ERROR';
      } else {
        throw new Error(`unknown sync event type`);
      }
    });
  }

  startSync() {
    this.pouchDbService.sync();
  }

}
