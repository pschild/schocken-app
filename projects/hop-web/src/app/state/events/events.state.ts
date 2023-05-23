import { Injectable } from '@angular/core';
import {
  EventDto,
  GameEventDto,
  GameEventRepository,
  RoundEventDto,
  RoundEventRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { insertItem, patch, removeItem } from '@ngxs/store/operators';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
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

  @Selector([EventsState.gameEvents, EventsState.roundEvents])
  static events(gameEvents: GameEventDto[], roundEvents: RoundEventDto[]): EventDto[] {
    return [...gameEvents, ...roundEvents];
  }

  constructor(
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
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

  @Action(EventsActions.CreateGameEvent)
  createGameEvent(
    ctx: StateContext<EventsStateModel>,
    { data }: EventsActions.CreateGameEvent
  ): Observable<GameEventDto> {
    return this.gameEventRepository.create(data).pipe(
      mergeMap(eventId => this.gameEventRepository.get(eventId)),
      tap(event => {
        ctx.setState(patch({
          gameEvents: insertItem(event)
        }));
      })
    );
  }

  @Action(EventsActions.RemoveGameEvent)
  removeGameEvent(
    ctx: StateContext<EventsStateModel>,
    { id }: EventsActions.RemoveGameEvent
  ): Observable<string> {
    return this.gameEventRepository.removeById(id).pipe(
      tap(() => {
        ctx.setState(patch({
          gameEvents: removeItem((event: EventDto) => event._id === id)
        }));
      })
    );
  }

  @Action(EventsActions.CreateRoundEvent)
  createRoundEvent(
    ctx: StateContext<EventsStateModel>,
    { data }: EventsActions.CreateRoundEvent
  ): Observable<RoundEventDto> {
    return this.roundEventRepository.create(data).pipe(
      mergeMap(eventId => this.roundEventRepository.get(eventId)),
      tap(event => {
        ctx.setState(patch({
          roundEvents: insertItem(event)
        }));
      })
    );
  }

  @Action(EventsActions.RemoveRoundEvent)
  removeRoundEvent(
    ctx: StateContext<EventsStateModel>,
    { id }: EventsActions.RemoveRoundEvent
  ): Observable<string> {
    return this.roundEventRepository.removeById(id).pipe(
      tap(() => {
        ctx.setState(patch({
          roundEvents: removeItem((event: EventDto) => event._id === id)
        }));
      })
    );
  }

}
