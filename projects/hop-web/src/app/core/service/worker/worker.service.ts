import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerMessage, WorkerResponse } from '../../worker/model';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private worker: Worker;

  workerMessages$: Subject<WorkerResponse> = new Subject();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('../../worker/statistics.worker', { type: 'module' });
      this.worker.onmessage = (event: MessageEvent) => {
        const response: WorkerResponse = event.data as WorkerResponse;
        if (response.error) {
          throw response.error;
        }
        this.workerMessages$.next(response);
      };
      this.worker.onerror = (event: ErrorEvent) => {
        throw new Error(event.message);
      };
    } else {
      throw new Error('Dieser Browser unterstützt keine Webworker.');
    }
  }

  postMessage(message: WorkerMessage): void {
    this.worker.postMessage(message);
  }

}
