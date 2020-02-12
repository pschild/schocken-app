import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConstitutionComponent } from './constitution.component';

const routes: Routes = [
  {
    path: '',
    component: ConstitutionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConstitutionRoutingModule { }
