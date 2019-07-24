import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRoutingModule } from './game-routing.module';
import { RoundComponent } from './round/round.component';
import { GameComponent } from './game.component';
import { FormsModule } from '@angular/forms';
import { GameEventsComponent } from './game-events/game-events.component';
import { EventListComponent } from './event-list/event-list.component';
import { EventTypeListComponent } from './event-type-list/event-type-list.component';
import { AttendeeListComponent } from './attendee-list/attendee-list.component';
import { MaterialModule } from '../material/material.module';
import { RoundEventsComponent } from './round-events/round-events.component';

@NgModule({
  declarations: [
    GameComponent,
    RoundComponent,
    AttendeeListComponent,
    GameEventsComponent,
    RoundEventsComponent,
    EventListComponent,
    EventTypeListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GameRoutingModule,
    MaterialModule
  ]
})
export class GameModule { }
