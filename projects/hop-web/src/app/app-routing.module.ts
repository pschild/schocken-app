import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'game',
    loadChildren: () => import('./game/game.module').then(m => m.GameModule)
  },
  {
    path: 'foobar',
    loadChildren: () => import('./foobar/foobar.module').then(m => m.FoobarModule)
  },
  {
    path: 'game-table',
    loadChildren: () => import('./game-table/game-table.module').then(m => m.GameTableModule)
  },
  {
    path: 'round',
    loadChildren: () => import('./round/round.module').then(m => m.RoundModule)
  },
  {
    path: 'attendees',
    loadChildren: () => import('./attendee/attendee.module').then(m => m.AttendeeModule)
  },
  {
    path: 'management',
    loadChildren: () => import('./management/management.module').then(m => m.ManagementModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'constitution',
    loadChildren: () => import('./constitution/constitution.module').then(m => m.ConstitutionModule)
  },
  {
    path: 'playground',
    loadChildren: () => import('./playground/playground.module').then(m => m.PlaygroundModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
