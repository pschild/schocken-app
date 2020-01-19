import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FoobarComponent } from './foobar.component';


const routes: Routes = [
  {
    path: ':gameId',
    component: FoobarComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FoobarRoutingModule { }
