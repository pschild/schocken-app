import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendeeListComponent } from './attendee-list/attendee-list.component';
import { AttendeesResolver } from './attendee-list/attendees.resolver';
import { RoundComponent } from './round/round.component';
import { RoundResolver } from './round/round.resolver';
import { GameResolver } from './round/game.resolver';

const routes: Routes = [
  {
    path: '',
    component: RoundComponent,
    resolve: {
      game: GameResolver,
      round: RoundResolver
    }
  },
  {
    path: 'attendees',
    component: AttendeeListComponent,
    resolve: {
      result: AttendeesResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
