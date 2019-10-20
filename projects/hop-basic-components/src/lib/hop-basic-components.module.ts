import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { NavigationComponent } from './navigation/navigation.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    NavigationComponent
  ],
  imports: [
    MaterialModule,
    RouterModule
  ],
  exports: [
    MaterialModule,
    NavigationComponent
  ]
})
export class HopBasicComponentsModule { }
