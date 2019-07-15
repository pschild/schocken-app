import { Injectable, Injector } from '@angular/core';
import { AppConfigRepository } from './app-config.repository';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class AppConfigProvider {

  private appConfig;

  constructor(private injector: Injector) { }

  loadAppConfig(): Observable<any> {
    const configRepo = this.injector.get(AppConfigRepository);
    return configRepo.load().pipe(
      tap(data => this.appConfig = data),
    );
  }

  get config() {
    return this.appConfig;
  }
}
