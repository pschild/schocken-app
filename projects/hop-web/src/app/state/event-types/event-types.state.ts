import { Injectable } from '@angular/core';
import {
  EventTypeContext,
  EventTypeDto,
  EventTypeRepository
} from '@hop-backend-api';
import { Action, Selector, State, StateContext, StateToken, createSelector } from '@ngxs/store';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { EventTypesActions } from './event-types.action';
import { groupBy, orderBy } from 'lodash';

export interface EventTypesStateModel {
  eventTypes: EventTypeDto[];
}

export const EVENT_TYPES_STATE = new StateToken<EventTypesStateModel>('eventTypes');

@State<EventTypesStateModel>({
  name: EVENT_TYPES_STATE,
  defaults: {
    eventTypes: [],
  }
})

@Injectable()
export class EventTypesState {

  @Selector()
  static eventTypes(state: EventTypesStateModel): EventTypeDto[] {
    return state.eventTypes || [];
  }

  static byId(id: string) {
    return createSelector(
      [EventTypesState.eventTypes],
      (eventTypes: EventTypeDto[]) =>
        eventTypes.find(eventType => eventType._id === id)
    );
  }

  static byContext(context: EventTypeContext) {
    return createSelector(
      [EventTypesState.eventTypes],
      (eventTypes: EventTypeDto[]) =>
        orderBy(eventTypes.filter(eventType => eventType.context === context), 'order', 'asc')
    );
  }

  @Selector([EventTypesState.eventTypes])
  static eventTypeGroups(eventTypes: EventTypeDto[]): { name: string; types: { id: string; description: string; }[] }[] {
    const transformedTypes = eventTypes.map(type => (
      { id: type._id, description: type.description, context: type.context, order: type.order }
    ));
    const groupedTypes = groupBy(transformedTypes, 'context');
    return [
      { name: 'Rundenereignisse', types: orderBy(groupedTypes[EventTypeContext.ROUND], 'order') },
      { name: 'Spielereignisse', types: orderBy(groupedTypes[EventTypeContext.GAME], 'order') }
    ];
  }

  constructor(
    private eventTypeRepository: EventTypeRepository,
  ) {}

  @Action(EventTypesActions.Initialize)
  initialize(ctx: StateContext<EventTypesStateModel>): Observable<EventTypeDto[]> {
    return this.eventTypeRepository.getAll().pipe(
      tap(eventTypes => ctx.patchState({ eventTypes })),
    );
  }

  @Action(EventTypesActions.Create)
  create(
    ctx: StateContext<EventTypesStateModel>,
    { data }: EventTypesActions.Create
  ): Observable<EventTypeDto> {
    return this.eventTypeRepository.create(data).pipe(
      mergeMap(eventTypeId => this.eventTypeRepository.get(eventTypeId)),
      tap(eventType => {
        ctx.setState(patch({
          eventTypes: insertItem(eventType)
        }));
      })
    );
  }

  @Action(EventTypesActions.Update)
  update(
    ctx: StateContext<EventTypesStateModel>,
    { id, data, skipHistory }: EventTypesActions.Update
  ): Observable<string> {
    return this.eventTypeRepository.update(id, data, skipHistory).pipe(
      switchMap(() => this.eventTypeRepository.get(id)),
      tap(updatedEventType => {
        ctx.setState(patch({
          eventTypes: updateItem((eventType: EventTypeDto) => eventType._id === id, updatedEventType)
        }));
      }),
      map(updatedEventType => updatedEventType._id)
    );
  }

  @Action(EventTypesActions.Remove)
  remove(
    ctx: StateContext<EventTypesStateModel>,
    { id }: EventTypesActions.Remove
  ): Observable<string> {
    return this.eventTypeRepository.removeById(id).pipe(
      tap(() => {
        ctx.setState(patch({
          eventTypes: removeItem((eventType: EventTypeDto) => eventType._id === id)
        }));
      })
    );
  }

}
