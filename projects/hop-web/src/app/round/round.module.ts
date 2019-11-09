import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoundRoutingModule } from './round-routing.module';
import { RoundComponent } from './round.component';
import { HopBasicComponentsModule } from '@hop-basic-components';


@NgModule({
  declarations: [RoundComponent],
  imports: [
    CommonModule,
    RoundRoutingModule,
    HopBasicComponentsModule
  ]
})
export class RoundModule { }
