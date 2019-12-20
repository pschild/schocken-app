import { NgModule } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const ENV = new InjectionToken<string>('env');

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [
  ]
})
export class HopBackendApiModule { }
