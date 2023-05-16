import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { GameComponent } from './game.component';
import { GameRoutingModule } from './game-routing.module';
import { IsParticipatingPipe } from './is-participating.pipe';

@NgModule({
  declarations: [
    GameComponent,
    IsParticipatingPipe,
  ],
  imports: [
    CommonModule,
    GameRoutingModule,
    HopBasicComponentsModule,
    ReactiveFormsModule
  ]
})
export class GameModule { }
