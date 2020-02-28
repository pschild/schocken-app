import { Injectable } from '@angular/core';
import { WorkerService } from '../core/service/worker/worker.service';
import { WorkerResponse, WorkerActions, WorkerMessage } from '../core/worker/model';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class StatisticsDataProvider {

  constructor(
    private workerService: WorkerService
  ) { }

  getSchockAusCount(): Observable<number> {
    const workerMessage: WorkerMessage = {
      action: WorkerActions.COUNT_EVENT_TYPE_BY_ID,
      payload: { eventTypeId: 'EVENT_TYPE__EVENT_TYPE-5101a0e9-3495-4fce-84c5-510f1a131059' }
    };
    this.workerService.postMessage(workerMessage);

    return this.workerService.workerMessages$.pipe(
      filter((response: WorkerResponse) => response.action === WorkerActions.COUNT_EVENT_TYPE_BY_ID),
      map((response: WorkerResponse) => response.payload.count)
    );
  }

  getRoundsCount(): Observable<number> {
    const workerMessage: WorkerMessage = { action: WorkerActions.COUNT_ROUNDS };
    this.workerService.postMessage(workerMessage);

    return this.workerService.workerMessages$.pipe(
      filter((response: WorkerResponse) => response.action === WorkerActions.COUNT_ROUNDS),
      map((response: WorkerResponse) => response.payload.count)
    );
  }
}
