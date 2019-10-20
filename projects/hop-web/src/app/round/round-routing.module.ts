import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoundComponent } from './round.component';


const routes: Routes = [
  {
    path: '',
    component: RoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoundRoutingModule { }
