import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoundRoutingModule } from './round-routing.module';
import { RoundComponent } from './round.component';


@NgModule({
  declarations: [RoundComponent],
  imports: [
    CommonModule,
    RoundRoutingModule
  ]
})
export class RoundModule { }
