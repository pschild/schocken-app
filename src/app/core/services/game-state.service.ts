import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameEvent, RoundEvent } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  gameEventsForPlayer$: BehaviorSubject<GameEvent[]> = new BehaviorSubject([]);
  roundEventsForPlayer$: BehaviorSubject<RoundEvent[]> = new BehaviorSubject([]);

  constructor() { }

}
