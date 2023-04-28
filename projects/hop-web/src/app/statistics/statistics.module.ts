import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsComponent } from './statistics.component';
import { StatisticsRoutingModule } from './statistics-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxsModule } from '@ngxs/store';
import { StatisticsState } from './state/statistics.state';

@NgModule({
  declarations: [StatisticsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StatisticsRoutingModule,
    HopBasicComponentsModule,
    NgxsModule.forFeature([StatisticsState])
  ]
})
export class StatisticsModule { }
