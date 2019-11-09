import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AttendeeComponent } from './attendee.component';


const routes: Routes = [
  {
    path: '',
    component: AttendeeComponent
  },
  {
    path: ':roundId',
    component: AttendeeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendeeRoutingModule { }
