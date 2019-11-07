import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';
import { GameListComponent } from './game-list/game-list.component';
import { RoundListComponent } from './round-list/round-list.component';
import { PlayerSelectComponent } from './player-select/player-select.component';
import { FormsModule } from '@angular/forms';
import { GameEventListComponent } from './game-event-list/game-event-list.component';
import { TableWrapperComponent } from './table-wrapper/table-wrapper.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';

@NgModule({
  declarations: [
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent,
    GameEventListComponent,
    TableWrapperComponent,
    EventTypeListComponent
  ],
  imports: [
    MaterialModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent,
    GameListComponent,
    RoundListComponent,
    PlayerSelectComponent,
    GameEventListComponent,
    TableWrapperComponent,
    EventTypeListComponent
  ]
})
export class HopBasicComponentsModule { }
