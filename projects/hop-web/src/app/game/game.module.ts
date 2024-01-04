import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { IsParticipatingPipe } from './is-participating.pipe';
import { IsFinalistPipe } from './is-finalist.pipe';
import { NgxsModule } from '@ngxs/store';
import { ActiveGameState } from './state';
import { PointsTableComponent } from './points-table/points-table.component';

@NgModule({
  declarations: [
    GameComponent,
    PointsTableComponent,
    IsParticipatingPipe,
    IsFinalistPipe,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    NgxsModule.forFeature([ActiveGameState]),
    HopBasicComponentsModule,
    ReactiveFormsModule
  ]
})
export class GameModule { }
