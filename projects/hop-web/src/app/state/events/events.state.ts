import { Injectable } from '@angular/core';
import {
  EventDto,
  GameEventDto,
  RoundEventDto,
  GameEventRepository,
  RoundEventRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { EventsActions } from './events.action';

export interface EventsStateModel {
  gameEvents: GameEventDto[];
  roundEvents: RoundEventDto[];
}

export const EVENTS_STATE = new StateToken<EventsStateModel>('events');

@State<EventsStateModel>({
  name: EVENTS_STATE,
  defaults: {
    gameEvents: [],
    roundEvents: [],
  }
})

@Injectable()
export class EventsState {

  @Selector()
  static gameEvents(state: EventsStateModel): GameEventDto[] {
    return state.gameEvents || [];
  }

  @Selector()
  static roundEvents(state: EventsStateModel): RoundEventDto[] {
    return state.roundEvents || [];
  }

  constructor(
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository
  ) {}

  @Action(EventsActions.Initialize)
  initialize(ctx: StateContext<EventsStateModel>): Observable<EventDto[]> {
    return forkJoin([
      this.gameEventRepository.getAll(),
      this.roundEventRepository.getAll(),
    ]).pipe(
      tap(([gameEvents, roundEvents]) => ctx.patchState({ gameEvents, roundEvents })),
      map(([gameEvents, roundEvents]) => [...gameEvents, ...roundEvents])
    );
  }

  // @Action(EventsActions.Create)
  // create(
  //   ctx: StateContext<EventsStateModel>,
  //   { data }: EventsActions.Create
  // ): Observable<EventDto> {
  //   return this.eventRepository.create(data).pipe(
  //     mergeMap(eventId => this.eventRepository.get(eventId)),
  //     tap(event => {
  //       ctx.setState(patch({
  //         events: insertItem(event)
  //       }));
  //     })
  //   );
  // }

  // @Action(EventsActions.Update)
  // update(
  //   ctx: StateContext<EventsStateModel>,
  //   { id, data }: EventsActions.Update
  // ): Observable<string> {
  //   return this.eventRepository.update(id, data).pipe(
  //     switchMap(() => this.eventRepository.get(id)),
  //     tap(updatedEvent => {
  //       ctx.setState(patch({
  //         events: updateItem((event: EventDto) => event._id === id, updatedEvent)
  //       }));
  //     }),
  //     map(updatedEvent => updatedEvent._id)
  //   );
  // }

  // @Action(EventsActions.Remove)
  // remove(
  //   ctx: StateContext<EventsStateModel>,
  //   { id }: EventsActions.Remove
  // ): Observable<string> {
  //   return this.eventRepository.removeById(id).pipe(
  //     tap(() => {
  //       ctx.setState(patch({
  //         events: removeItem((event: EventDto) => event._id === id)
  //       }));
  //     })
  //   );
  // }

}
