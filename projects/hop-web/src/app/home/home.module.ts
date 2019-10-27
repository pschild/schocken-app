import { NgModule } from '@angular/core';

import { HomeComponent } from './home.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import { HopBasicComponentsModule } from '@hop-basic-components';

@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomeRoutingModule,
    HopBasicComponentsModule
  ],
  providers: []
})
export class HomeModule { }
