import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [StatisticsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatisticsRoutingModule,
    HopBasicComponentsModule
  ]
})
export class StatisticsModule { }
