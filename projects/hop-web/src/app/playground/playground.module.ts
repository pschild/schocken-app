import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PlaygroundComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PlaygroundRoutingModule,
    HopBasicComponentsModule
  ]
})
export class PlaygroundModule { }
