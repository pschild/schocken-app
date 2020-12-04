import { Injectable } from '@angular/core';
import { Observable, fromEvent, Observer } from 'rxjs';
import { WorkerMessage, WorkerResponse } from '../../worker/model';
import { map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  private worker: Worker;
  private responseStream$: Observable<WorkerResponse>;

  constructor() {
    this.initializeWorker();
  }

  sendMessage(message: WorkerMessage): Observable<WorkerResponse> {
    const uuid = this.generateUuid();
    message.uuid = uuid;

    return new Observable((observer: Observer<WorkerResponse>) => {
      this.responseStream$.pipe(
        filter((response: WorkerResponse) => response.uuid === uuid)
      ).subscribe((response: WorkerResponse) => {
        observer.next(response);
        observer.complete();
      });

      this.worker.postMessage(message);
    });
  }

  private initializeWorker(): void {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker('../../worker/statistics.worker', { type: 'module' });
      this.responseStream$ = fromEvent(this.worker, 'message').pipe(
        map((event: MessageEvent) => {
          const response: WorkerResponse = event.data as WorkerResponse;
          if (response.error) {
            throw response.error;
          }
          return response;
        })
      );
    } else {
      throw new Error('Dieser Browser unterstützt keine Webworker.');
    }
  }

  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line:no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}
