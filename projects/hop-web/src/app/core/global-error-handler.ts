import { ErrorHandler, Injectable, Inject, InjectionToken } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from '../../environments/environment';
import { SnackBarNotificationService } from '@hop-basic-components';
import Rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: environment.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
};

export const RollbarService = new InjectionToken<Rollbar>('rollbar');

export function rollbarFactory() {
  return new Rollbar(rollbarConfig);
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(
    private snackBarNotificationService: SnackBarNotificationService,
    @Inject(RollbarService) private rollbar: Rollbar
  ) {
    Sentry.init({
      dsn: environment.env.SENTRY_URL,
      defaultIntegrations: false // prevent global error handler and only capture the caught exceptions
    });
  }

  handleError(error: any) {
    this.snackBarNotificationService.showMessage(`Es ist ein Fehler aufgetreten: ${error}`);

    // send errors in prod mode only
    if (environment.production) {
      this.rollbar.error(error.originalError || error);
      Sentry.captureException(error.originalError || error);
    } else {
      throw error;
    }
  }
}
