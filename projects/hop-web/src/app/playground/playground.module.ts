import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { HopBasicComponentsModule } from '@hop-basic-components';

@NgModule({
  declarations: [
    PlaygroundComponent
  ],
  imports: [
    CommonModule,
    PlaygroundRoutingModule,
    HopBasicComponentsModule
  ]
})
export class PlaygroundModule { }
