import { Injectable } from '@angular/core';
import { WorkerService } from '../core/service/worker/worker.service';
import { WorkerResponse, WorkerActions } from '../core/worker/model';
import { map, mergeMap, mergeAll, toArray } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { EventTypeRepository, EventTypeDto } from '@hop-backend-api';

@Injectable({
  providedIn: 'root'
})

export class StatisticsDataProvider {

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private workerService: WorkerService
  ) { }

  getCountsByEventType$(): Observable<Array<{ description: string; count: number; }>> {
    return this.eventTypeRepository.getAll().pipe(
      mergeAll(),
      mergeMap((eventType: EventTypeDto) => this.workerService.sendMessage({
        action: WorkerActions.COUNT_EVENT_TYPE_BY_ID,
        payload: { eventTypeId: eventType._id }
      }).pipe(
        map((response: WorkerResponse) => ({ description: eventType.description, count: response.payload.count }))
      )),
      toArray()
    );
  }

  getRoundsCount$(): Observable<number> {
    return this.workerService.sendMessage({ action: WorkerActions.COUNT_ROUNDS }).pipe(
      map((response: WorkerResponse) => response.payload.count)
    );
  }
}
