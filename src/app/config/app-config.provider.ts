import { Injectable, Injector } from '@angular/core';
import { AppConfigRepository } from './app-config.repository';

@Injectable()
export class AppConfigProvider {

  private appConfig;

  constructor(private injector: Injector) { }

  loadAppConfig(): Promise<any> {
    const configRepo = this.injector.get(AppConfigRepository);
    return configRepo.load()
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  get config() {
    return this.appConfig;
  }
}
