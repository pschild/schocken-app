import { Component } from '@angular/core';
import { PouchDbService } from './services/pouchDb.service';
import { CheckForUpdateService } from './services/check-for-update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(private pouchDbService: PouchDbService, private updateService: CheckForUpdateService) {
    this.pouchDbService.initialize();
  }

}
