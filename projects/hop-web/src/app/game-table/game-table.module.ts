import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameTableRoutingModule } from './game-table-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameTableComponent } from './game-table.component';
import { GetEventsForPlayerPipe } from './get-events-for-player.pipe';
import { EventListComponent } from './event-list/event-list.component';

@NgModule({
  declarations: [
    GameTableComponent,
    GetEventsForPlayerPipe,
    EventListComponent
  ],
  imports: [
    CommonModule,
    GameTableRoutingModule,
    HopBasicComponentsModule
  ]
})
export class GameTableModule { }
