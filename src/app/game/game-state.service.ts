import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Event } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  eventsForPlayer$: BehaviorSubject<Event[]> = new BehaviorSubject([]);

  constructor() { }

}
