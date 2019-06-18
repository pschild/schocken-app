import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as x from '../assets/config.json';

@Injectable()
export class AppConfigService {

  private appConfig;

  constructor(private injector: Injector) {
    console.log(x);
  }

  loadAppConfig() {
    const http = this.injector.get(HttpClient);
    return http.get('./assets/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  get config() {
    return this.appConfig;
  }
}
