import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameTableRoutingModule } from './game-table-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameTableComponent } from './game-table.component';
import { GetEventsForPlayerPipe } from './pipe/get-events-for-player.pipe';
import { GetParticipationStatusForPlayerPipe } from './pipe/get-participation-status-for-player.pipe';
import { HandlerPipe } from './pipe/handler.pipe';

@NgModule({
  declarations: [
    GameTableComponent,
    GetEventsForPlayerPipe,
    GetParticipationStatusForPlayerPipe,
    HandlerPipe
  ],
  imports: [
    CommonModule,
    GameTableRoutingModule,
    HopBasicComponentsModule
  ]
})
export class GameTableModule { }
