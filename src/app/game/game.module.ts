import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { PlayerOrderComponent } from './player-order/player-order.component';
import { RoundComponent } from './round/round.component';
import { GameComponent } from './game.component';
import { FormsModule } from '@angular/forms';
import { GameSettingsComponent } from './game-settings/game-settings.component';
import { GameEventsComponent } from './game-events/game-events.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';

@NgModule({
  declarations: [
    GameComponent,
    RoundComponent,
    GameSettingsComponent,
    PlayerOrderComponent,
    GameEventsComponent,
    EventListComponent,
    EventTypeListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GameRoutingModule
  ]
})
export class GameModule { }
