import { NgModule } from '@angular/core';
import { InjectionToken } from '@angular/core';

export const DB_CONFIG = new InjectionToken<string>('dbConfig');

@NgModule({
  declarations: [],
  imports: [
  ],
  exports: [
  ]
})
export class HopBackendApiModule { }
