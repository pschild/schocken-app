import { Component } from '@angular/core';
import { PouchDbService } from './pouchDb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent {

  constructor(private pouchDbService: PouchDbService) {
    this.pouchDbService.initialize();
  }

}
