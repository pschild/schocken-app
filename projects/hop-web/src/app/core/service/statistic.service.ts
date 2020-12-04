import { Injectable } from '@angular/core';
import { CelebrationModalComponent } from '@hop-basic-components';
import { MatDialog } from '@angular/material/dialog';
import { EventTypeDto, EventTypeRepository } from '@hop-backend-api';
import { WorkerService } from './worker/worker.service';
import { WorkerResponse, WorkerMessage, WorkerActions } from '../worker/model';
import { EventTypeCountPayload, RoundCountPayload } from '../worker/model/worker-response';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  NUMBERS_TO_CELEBRATE: number[] = [1, 100, 333, 500, 1000, 3333, 5000, 10000];

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private workerService: WorkerService,
    private dialog: MatDialog
  ) { }

  checkEventType(eventTypeId: string): void {
    const workerMessage: WorkerMessage = { action: WorkerActions.COUNT_EVENT_TYPE_BY_ID, payload: { eventTypeId } };
    this.workerService.sendMessage(workerMessage).subscribe((response: WorkerResponse) => {
      const payload = response.payload as EventTypeCountPayload;
      if (this.NUMBERS_TO_CELEBRATE.includes(payload.count)) {
        this.eventTypeRepository.get(payload.eventTypeId).subscribe((eventType: EventTypeDto) => {
          this.dialog.open(CelebrationModalComponent, {
            height: '80%',
            width: '90%',
            autoFocus: false,
            data: {
              countValue: payload.count,
              eventName: eventType.description
            }
          });
        });
      }
    });
  }

  checkRounds(): void {
    const workerMessage: WorkerMessage = { action: WorkerActions.COUNT_ROUNDS };
    this.workerService.sendMessage(workerMessage).subscribe((response: WorkerResponse) => {
      const payload = response.payload as RoundCountPayload;
      if (this.NUMBERS_TO_CELEBRATE.includes(payload.count)) {
        this.dialog.open(CelebrationModalComponent, {
          height: '80%',
          width: '90%',
          autoFocus: false,
          data: {
            countValue: payload.count,
            eventName: 'Runden'
          }
        });
      }
    });
  }

}
