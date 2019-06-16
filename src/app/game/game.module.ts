import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { PlayerOrderComponent } from './player-order/player-order.component';
import { RoundComponent } from './round/round.component';
import { GameComponent } from './game.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    GameComponent,
    PlayerOrderComponent,
    RoundComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GameRoutingModule
  ]
})
export class GameModule { }
