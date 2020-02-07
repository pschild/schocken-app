import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameTableRoutingModule } from './game-table-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameTableComponent } from './game-table.component';
import { GetEventsForPlayerPipe } from './get-events-for-player.pipe';
import { EventListComponent } from './event-list/event-list.component';
import { GetParticipationStatusForPlayerPipe } from './get-participation-status-for-player.pipe';

@NgModule({
  declarations: [
    GameTableComponent,
    GetEventsForPlayerPipe,
    GetParticipationStatusForPlayerPipe,
    EventListComponent
  ],
  imports: [
    CommonModule,
    GameTableRoutingModule,
    HopBasicComponentsModule
  ]
})
export class GameTableModule { }
