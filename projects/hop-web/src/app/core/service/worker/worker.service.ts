import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WorkerMessage, WorkerReponse } from '../../worker/model';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private worker: Worker;

  workerMessages$: Subject<WorkerReponse> = new Subject();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('../../worker/indexedDb.worker', { type: 'module' });
      this.worker.onmessage = (event: MessageEvent) => {
        const response: WorkerReponse = event.data as WorkerReponse;
        if (response.error) {
          throw response.error;
        }
        this.workerMessages$.next(response);
      };
    } else {
      throw new Error('Dieser Browser unterstützt keine Webworker.');
    }
  }

  postMessage(message: WorkerMessage): void {
    this.worker.postMessage(message);
  }

}
