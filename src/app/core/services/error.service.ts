import { ErrorHandler, Injectable } from '@angular/core';
import { DialogService } from '../../shared/dialog/dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private dialogService: DialogService) {}

  handleError(error: any) {
    this.dialogService.showErrorDialog({
      title: 'Huch...',
      message: error
    });
  }
}
