import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameTableRoutingModule } from './game-table-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameTableComponent } from './game-table.component';
import { GetAllEventsPipe } from './pipe/get-all-events.pipe';
import { GetParticipationStatusForPlayerPipe } from './pipe/get-participation-status-for-player.pipe';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    GameTableComponent,
    GetAllEventsPipe,
    GetParticipationStatusForPlayerPipe
  ],
  imports: [
    CommonModule,
    GameTableRoutingModule,
    HopBasicComponentsModule,
    ReactiveFormsModule
  ]
})
export class GameTableModule { }
