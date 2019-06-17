import { Component } from '@angular/core';
import { PouchDbService } from './pouchDb.service';
import { CheckForUpdateService } from './check-for-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(private pouchDbService: PouchDbService, private checkForUpdateService: CheckForUpdateService) {
    this.pouchDbService.initialize();
  }

}
