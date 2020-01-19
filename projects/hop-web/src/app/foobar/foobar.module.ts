import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoobarComponent } from './foobar.component';
import { FoobarRoutingModule } from './foobar-routing.module';

@NgModule({
  declarations: [FoobarComponent],
  imports: [
    CommonModule,
    FoobarRoutingModule
  ]
})
export class FoobarModule { }
