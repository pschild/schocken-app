import { Injectable } from '@angular/core';
import {
  EventDto,
  GameEventDto,
  RoundEventDto,
  GameEventRepository,
  RoundEventRepository,
  EventTypeDto,
  EventTypeTrigger
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { insertItem, patch, removeItem } from '@ngxs/store/operators';
import { Observable, forkJoin, of } from 'rxjs';
import { filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { EventsActions } from './events.action';
import { groupBy, sumBy } from 'lodash';
import { EventTypesState } from '../event-types';
import { StatisticsStateUtil } from '../../statistics/state/statistics-state.util';
import { SCHOCK_AUS_EVENT_TYPE_ID } from '../../statistics/model/event-type-ids';
import { DialogResult, DialogService, IDialogResult, LOST_EVENT_BUTTON_CONFIG } from '@hop-basic-components';

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

  static gameEventsByGameIdWithType(gameId: string) {
    return createSelector(
      [EventsState.gameEvents, EventTypesState.gameEventTypes],
      (events: GameEventDto[], eventTypes: EventTypeDto[]) => {
        return events
          .filter(event => event.gameId === gameId)
          .map(event => ({ ...event, eventType: StatisticsStateUtil.eventTypeByEvent(event, eventTypes) }));
      }
    );
  }

  static roundEventsByRoundIdsWithType(roundIds: string[]) {
    return createSelector(
      [EventsState.roundEvents, EventTypesState.roundEventTypes],
      (events: RoundEventDto[], eventTypes: EventTypeDto[]) => {
        return events
          .filter(event => roundIds.includes(event.roundId))
          .map(event => ({ ...event, eventType: StatisticsStateUtil.eventTypeByEvent(event, eventTypes) }));
      }
    );
  }

  static gameEventsByGameIdGroupedByPlayer(gameId: string) {
    return createSelector(
      [EventsState.gameEventsByGameIdWithType(gameId)],
      (events: (GameEventDto & { eventType: EventTypeDto })[]) => {
        const filteredEvents = events
          .map(event => ({
            eventId: event._id,
            playerId: event.playerId,
            comment: event.comment,
            description: event.eventType.description,
            penalty: event.eventType.penalty ? event.eventType.penalty.value * (event.multiplicatorValue || 1) : undefined,
            unit: event.eventType.penalty ? event.eventType.penalty.unit : undefined,
          }));
        const groupedByPlayer = groupBy(filteredEvents, 'playerId');
        return Object.keys(groupedByPlayer).reduce((acc: { [playerId: string]: { events: any; penalties: any; } }, playerId: string) =>
          ({
            ...acc,
            [playerId]: {
              events: groupedByPlayer[playerId],
              penalties: EventsState.sumsPerUnit(groupedByPlayer[playerId])
            }
          }),
          {}
        );
      }
    );
  }

  static roundEventsByRoundIdsGroupedByPlayer(roundIds: string[]) {
    return createSelector(
      [EventsState.roundEventsByRoundIdsWithType(roundIds)],
      (events: (RoundEventDto & { eventType: EventTypeDto })[]) => {
        const filteredEvents = events
          .map(event => ({
            eventId: event._id,
            playerId: event.playerId,
            roundId: event.roundId,
            comment: event.comment,
            description: event.eventType.description,
            penalty: event.eventType.penalty ? event.eventType.penalty.value * (event.multiplicatorValue || 1) : undefined,
            unit: event.eventType.penalty ? event.eventType.penalty.unit : undefined,
          }));
        const groupedByPlayer = groupBy(filteredEvents, 'playerId');
        return Object.keys(groupedByPlayer).reduce((acc: { [playerId: string]: { events: any; penalties: any; } }, playerId: string) => {
          const groupedByRound = groupBy(groupedByPlayer[playerId], 'roundId');
          const penaltiesPerRound = Object.keys(groupedByRound).reduce((roundAcc, roundId) => {
            const eventsWithPenalty = groupedByRound[roundId].filter(e => e.unit);
            return { ...roundAcc, [roundId]: { events: groupedByRound[roundId], penalties: EventsState.sumsPerUnit(eventsWithPenalty) } };
          }, {});
          return { ...acc, [playerId]: penaltiesPerRound };
        }, {});
      }
    );
  }

  static penaltiesByGameId(gameId: string) {
    return createSelector(
      [EventsState.gameEventsByGameIdWithType(gameId)],
      (events: (GameEventDto & { eventType: EventTypeDto })[]) => {
        const filteredEvents = events
          .map(event => ({
              playerId: event.playerId,
              description: event.eventType.description,
              penalty: event.eventType.penalty ? event.eventType.penalty.value * (event.multiplicatorValue || 1) : undefined,
              unit: event.eventType.penalty ? event.eventType.penalty.unit : undefined,
          }));
        return EventsState.sumsPerUnit(filteredEvents);
      }
    );
  }

  static penaltiesByRoundIds(roundIds: string[]) {
    return createSelector(
      [EventsState.roundEventsByRoundIdsWithType(roundIds)],
      (events: (RoundEventDto & { eventType: EventTypeDto })[]) => {
        const filteredEvents = events
          .map(event => ({
              roundId: event.roundId,
              description: event.eventType.description,
              penalty: event.eventType.penalty ? event.eventType.penalty.value * (event.multiplicatorValue || 1) : undefined,
              unit: event.eventType.penalty ? event.eventType.penalty.unit : undefined,
          }));
        const groupedByRound = groupBy(filteredEvents, 'roundId');
        return Object.keys(groupedByRound).reduce((acc: { [roundId: string]: { sum: number; } }, roundId: string) => {
          const eventsWithPenalty = groupedByRound[roundId].filter(e => e.unit);
          return { ...acc, [roundId]: EventsState.sumsPerUnit(eventsWithPenalty) };
        }, {});
      }
    );
  }

  static schockAusByRoundIds(roundIds: string[]) {
    return createSelector(
      [EventsState.roundEventsByRoundIdsWithType(roundIds)],
      (events: (RoundEventDto & { eventType: EventTypeDto })[]) => {
        const filteredEvents = events
          .filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID);
        const groupedByRound = groupBy(filteredEvents, 'roundId');
        return Object.keys(groupedByRound).reduce((acc: { [roundId: string]: number }, roundId: string) =>
          ({ ...acc, [roundId]: groupedByRound[roundId].length }),
          {}
        );
      }
    );
  }

  // TODO: PenaltyState? PenaltyUtils
  private static sumsPerUnit(
    eventsWithType: {
      unit: string;
      penalty: number;
    }[]
  ): { sum: number; unit: string; }[] {
    const groupedByUnit = groupBy(eventsWithType, 'unit');
    return Object.keys(groupedByUnit)
      .map(unit => ({
        unit,
        sum: sumBy(groupedByUnit[unit], 'penalty')
      }));
  }

  constructor(
    private gameEventRepository: GameEventRepository,
    private roundEventRepository: RoundEventRepository,
    private dialogService: DialogService,
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
      }),
      // mergeMap(() => this.handleEventTrigger(data.trigger))
    );
  }

  // private handleEventTrigger(trigger: EventTypeTrigger): Observable<any> {
  //   switch (trigger) {
  //     case EventTypeTrigger.SCHOCK_AUS:
  //       return of(null);
  //     case EventTypeTrigger.START_NEW_ROUND:
  //       return of(null);
  //   }
  // }

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
