import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoundComponent } from './round.component';


const routes: Routes = [
  {
    path: ':roundId',
    component: RoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoundRoutingModule { }
