import { Component, OnInit } from '@angular/core';
import { SyncService } from './core/service/sync.service';

@Component({
  selector: 'hop-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private syncService: SyncService) {
  }

  ngOnInit() {
    this.syncService.startSync(true);
  }

}
