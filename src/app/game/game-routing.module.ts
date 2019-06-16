import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game.component';
import { PlayerOrderComponent } from './player-order/player-order.component';

const routes: Routes = [
  {
    path: '',
    component: GameComponent
  },
  {
    path: 'player-order',
    component: PlayerOrderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
