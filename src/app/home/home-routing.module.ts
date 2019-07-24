import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { GamesResolver } from './games.resolver';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {
      games: GamesResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
