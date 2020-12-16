import { Injectable } from '@angular/core';
import { CelebrationModalComponent } from '@hop-basic-components';
import { MatDialog } from '@angular/material/dialog';
import {
  EventDto,
  EventTypeContext,
  EventTypeDto,
  EventTypeRepository,
  GameEventRepository,
  RoundDto,
  RoundEventRepository,
  RoundRepository
} from '@hop-backend-api';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {

  NUMBERS_TO_CELEBRATE: number[] = [1, 100, 333, 500, 1000, 3333, 5000, 10000];

  constructor(
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private eventTypeRepository: EventTypeRepository,
    private roundRepository: RoundRepository,
    private dialog: MatDialog
  ) { }

  checkEventType(eventTypeId: string, context: EventTypeContext): void {
    let eventTypeCount$;
    if (context === EventTypeContext.ROUND) {
      eventTypeCount$ = this.roundEventRepository.findByEventTypeId(eventTypeId);
    } else {
      eventTypeCount$ = this.gameEventRepository.findByEventTypeId(eventTypeId);
    }
    eventTypeCount$.subscribe((events: EventDto[]) => {
      const count = events.length;
      console.log('eventTypeCount', eventTypeId, count);
      if (this.NUMBERS_TO_CELEBRATE.includes(count)) {
        this.eventTypeRepository.get(eventTypeId).subscribe((eventType: EventTypeDto) => {
          this.dialog.open(CelebrationModalComponent, {
            height: '80%',
            width: '90%',
            autoFocus: false,
            data: {
              countValue: count,
              eventName: eventType.description
            }
          });
        });
      }
    });
  }

  checkRounds(): void {
    this.roundRepository.getAll().subscribe((rounds: RoundDto[]) => {
      const count = rounds.length;
      console.log('checkRounds', count);
      if (this.NUMBERS_TO_CELEBRATE.includes(count)) {
        this.dialog.open(CelebrationModalComponent, {
          height: '80%',
          width: '90%',
          autoFocus: false,
          data: {
            countValue: count,
            eventName: 'Runden'
          }
        });
      }
    });
  }

}
