import { Component } from '@angular/core';
import { CheckForUpdateService } from './services/check-for-update.service';
import { PouchDbAdapter } from './db/pouchdb.adapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(private pouchDb: PouchDbAdapter, private updateService: CheckForUpdateService) {
    this.pouchDb.initialize();
  }

}
