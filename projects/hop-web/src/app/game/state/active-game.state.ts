import { Injectable, NgZone } from '@angular/core';
import {
  EventTypeDto,
  EventTypeTrigger,
  GameDto,
  GameEventDto,
  PlayerDto,
  RoundDto,
  RoundEventDto
} from '@hop-backend-api';
import { AllPlayerSelectionModalComponent, DialogResult, DialogService, EventTypeListModalComponent, IDialogResult, LOST_EVENT_BUTTON_CONFIG } from '@hop-basic-components';
import { Action, Selector, State, StateContext, StateToken, Store, createSelector } from '@ngxs/store';
import { groupBy, orderBy, uniq } from 'lodash';
import { EMPTY, Observable, of } from 'rxjs';
import { filter, mergeMap, tap } from 'rxjs/operators';
import { EventTypesState } from '../../state/event-types';
import { EventUtil, EventsActions, EventsState } from '../../state/events';
import { GamesActions, GamesState } from '../../state/games';
import { PlayersState } from '../../state/players';
import { RoundsActions } from '../../state/rounds/rounds.action';
import { RoundsState } from '../../state/rounds/rounds.state';
import { SCHOCK_AUS_EVENT_TYPE_ID, SCHOCK_AUS_STRAFE_EVENT_TYPE_ID } from '../../statistics/model/event-type-ids';
import { ActiveGameActions } from './active-game.action';
import { ActiveGameUtil } from './active-game.util';

export interface ActiveGameStateModel {
  gameId: string;
}

export const ACTIVE_GAME_STATE = new StateToken<ActiveGameStateModel>('activegame');

@State<ActiveGameStateModel>({
  name: ACTIVE_GAME_STATE,
  defaults: {
    gameId: undefined,
  }
})

@Injectable()
export class ActiveGameState {

  @Selector()
  static gameId(state: ActiveGameStateModel): string {
    return state.gameId;
  }

  @Selector([ActiveGameState.gameId, GamesState.games])
  static game(gameId: string, games: GameDto[]): GameDto {
    return games.find(game => game._id === gameId);
  }

  static rounds(ordered = false) {
    return createSelector(
      [ActiveGameState.gameId, RoundsState.rounds],
      (gameId: string, rounds: RoundDto[]): RoundDto[] => {
        const filtered = rounds.filter(round => round.gameId === gameId);
        return ordered ? orderBy(filtered, 'datetime') : filtered;
      }
    );
  }

  @Selector([ActiveGameState.rounds()])
  static roundIds(rounds: RoundDto[]): string[] {
    return rounds.map(round => round._id);
  }

  @Selector([ActiveGameState.rounds(true)])
  static lastRound(rounds: RoundDto[]): RoundDto {
    return rounds.length > 0 ? rounds[rounds.length - 1] : undefined;
  }

  @Selector([ActiveGameState.rounds()])
  static uniqueAttendees(rounds: RoundDto[]): string[] {
    return uniq([].concat.apply([], rounds.map(round =>
      round.attendeeList.map(at => at.playerId))
    ));
  }

  @Selector([PlayersState.players, PlayersState.activePlayers, ActiveGameState.uniqueAttendees])
  static playerList(players: PlayerDto[], activePlayers: PlayerDto[], uniqueAttendees: string[]): PlayerDto[] {
    const list = uniq([...activePlayers.map(player => player._id), ...uniqueAttendees]);
    const filtered = players.filter(player => list.includes(player._id));
    return orderBy(filtered, 'name');
  }
  
  @Selector([ActiveGameState.gameId, EventsState.gameEvents, EventTypesState.gameEventTypes])
  static mappedGameEvents(gameId: string, events: GameEventDto[], eventTypes: EventTypeDto[]): any {
    const eventsWithType = EventUtil.eventsWithType(EventUtil.filterByGameId(gameId, events), eventTypes);
    return eventsWithType.map(eventWithType => ActiveGameUtil.mapToView(eventWithType));
  }
  
  @Selector([ActiveGameState.roundIds, EventsState.roundEvents, EventTypesState.roundEventTypes])
  static mappedRoundEvents(roundIds: string[], events: RoundEventDto[], eventTypes: EventTypeDto[]): any {
    const eventsWithType = EventUtil.eventsWithType(EventUtil.filterByRoundIds(roundIds, events), eventTypes);
    return eventsWithType.map(eventWithType => ({
      ...ActiveGameUtil.mapToView(eventWithType),
      roundId: (eventWithType.event as RoundEventDto).roundId,
    }));
  }

  @Selector([ActiveGameState.mappedGameEvents])
  static gameEvents(events: any[]): any {
    const groupedByPlayer = groupBy(events, 'playerId');
    return Object.keys(groupedByPlayer).reduce((acc: { [playerId: string]: { events: any; penalties: any; } }, playerId: string) =>
      ({
        ...acc,
        [playerId]: {
          events: groupedByPlayer[playerId],
          penalties: EventUtil.sumsPerUnit(groupedByPlayer[playerId])
        }
      }),
      {}
    );
  }

  @Selector([ActiveGameState.mappedRoundEvents])
  static roundEvents(events: any[]): any {
    const groupedByPlayer = groupBy(events, 'playerId');
    return Object.keys(groupedByPlayer).reduce((acc: { [playerId: string]: { events: any; penalties: any; } }, playerId: string) => {
      const groupedByRound = groupBy(groupedByPlayer[playerId], 'roundId');
      const penaltiesPerRound = Object.keys(groupedByRound).reduce((roundAcc, roundId) => {
        const eventsWithPenalty = groupedByRound[roundId].filter(e => e.unit);
        return { ...roundAcc, [roundId]: { events: groupedByRound[roundId], penalties: EventUtil.sumsPerUnit(eventsWithPenalty) } };
      }, {});
      return { ...acc, [playerId]: penaltiesPerRound };
    }, {});
  }

  @Selector([ActiveGameState.mappedGameEvents])
  static gamePenalties(events: any[]): any {
    return EventUtil.sumsPerUnit(events);
  }

  @Selector([ActiveGameState.mappedRoundEvents])
  static roundPenalties(events: any[]): any {
    const groupedByRound = groupBy(events, 'roundId');
    return Object.keys(groupedByRound).reduce((acc: { [roundId: string]: { sum: number; } }, roundId: string) => {
      const eventsWithPenalty = groupedByRound[roundId].filter(e => e.unit);
      return { ...acc, [roundId]: EventUtil.sumsPerUnit(eventsWithPenalty) };
    }, {});
  }

  @Selector([ActiveGameState.roundIds, EventsState.roundEvents])
  static schockAusCounts(roundIds: string[], events: RoundEventDto[]): any {
    const schockAusEvents = EventUtil.filterByRoundIds(roundIds, events)
      .filter(event => event.eventTypeId === SCHOCK_AUS_EVENT_TYPE_ID);
    const groupedByRound = groupBy(schockAusEvents, 'roundId');
    return Object.keys(groupedByRound).reduce((acc: { [roundId: string]: number }, roundId: string) =>
      ({ ...acc, [roundId]: groupedByRound[roundId].length }),
      {}
    );
  }

  constructor(
    private store: Store,
    private dialogService: DialogService,
    private ngZone: NgZone
  ) {}

  @Action(ActiveGameActions.Initialize)
  initialize(
    ctx: StateContext<ActiveGameStateModel>,
    { gameId }: ActiveGameActions.Initialize
  ) {
    ctx.patchState({ gameId })
  }

  @Action(ActiveGameActions.AddGameEvent)
  addGameEvent(
    ctx: StateContext<ActiveGameStateModel>,
    { player }: ActiveGameActions.AddGameEvent
  ): Observable<any> {
    return this.ngZone.run<Observable<any>>(() => {
      const gameId = ctx.getState().gameId;
      return this.dialogService.openCustomDialog(
        EventTypeListModalComponent,
        {
          width: '500px',
          maxWidth: '90%',
          autoFocus: false,
          data: {
            eventTypes: this.store.selectSnapshot(EventTypesState.gameEventTypes),
            player,
            gameId,
          }
        }
      ).pipe(
        filter(dialogResult => !!dialogResult),
        mergeMap(dialogResult => {
          const { eventType, playerId, gameId } = dialogResult;
          const { _id, multiplicatorValue, comment, trigger } = eventType; // TODO: multiplicatorValue, comment sind nicht aus EventTypeDto!
          const payload = {
            eventTypeId: _id,
            multiplicatorValue,
            comment,
            trigger,
            playerId,
          };
  
          return this.store.dispatch(new EventsActions.CreateGameEvent({ ...payload, gameId })).pipe(
            mergeMap(() => this.store.dispatch(new ActiveGameActions.GameEventAdded(payload.eventTypeId))),
            mergeMap(() => this.verarbeiteTrigger(trigger, player))
          );
        })
      );
    });
  }

  @Action(ActiveGameActions.AddRoundEvent)
  addRoundEvent(
    ctx: StateContext<ActiveGameStateModel>,
    { player, roundId }: ActiveGameActions.AddRoundEvent
  ): Observable<any> {
    return this.ngZone.run<Observable<any>>(() => {
      return this.dialogService.openCustomDialog(
        EventTypeListModalComponent,
        {
          width: '500px',
          maxWidth: '90%',
          autoFocus: false,
          data: {
            eventTypes: this.store.selectSnapshot(EventTypesState.roundEventTypes),
            player,
            roundId,
          }
        }
      ).pipe(
        filter(dialogResult => !!dialogResult),
        mergeMap(dialogResult => {
          const { eventType, playerId, roundId } = dialogResult;
          const { _id, multiplicatorValue, comment, trigger } = eventType; // TODO: multiplicatorValue, comment sind nicht aus EventTypeDto!
          const payload = {
            eventTypeId: _id,
            multiplicatorValue,
            comment,
            trigger,
            playerId,
          };
  
          return this.store.dispatch(new EventsActions.CreateRoundEvent({ ...payload, roundId })).pipe(
            mergeMap(() => this.store.dispatch(new ActiveGameActions.RoundEventAdded(payload.eventTypeId))),
            mergeMap(() => this.verarbeiteTrigger(trigger, player, roundId))
          );
        })
      );
    });
  }

  @Action(ActiveGameActions.RemoveGameEvent)
  removeGameEvent(
    ctx: StateContext<ActiveGameStateModel>,
    { eventId }: ActiveGameActions.RemoveGameEvent
  ): Observable<any> {
    return this.store.dispatch(new EventsActions.RemoveGameEvent(eventId));
  }

  @Action(ActiveGameActions.RemoveRoundEvent)
  removeRoundEvent(
    ctx: StateContext<ActiveGameStateModel>,
    { eventId }: ActiveGameActions.RemoveRoundEvent
  ): Observable<any> {
    return this.store.dispatch(new EventsActions.RemoveRoundEvent(eventId));
  }

  private verarbeiteTrigger(trigger: EventTypeTrigger, player: PlayerDto, roundId?: string): Observable<any> {
    switch (trigger) {
      case EventTypeTrigger.SCHOCK_AUS:
        return this.handleSchockAusTrigger(player, roundId);
      case EventTypeTrigger.START_NEW_ROUND:
        return this.handleStartNewRoundTrigger(player);
      default:
        return of(null);
    }
  }

  private handleSchockAusTrigger(player: PlayerDto, roundId: string): Observable<any> {
    const round = this.store.selectSnapshot(ActiveGameState.rounds()).find(round => round._id === roundId);
    if (!round) {
      return EMPTY;
    }
    const activePlayers = this.store.selectSnapshot(PlayersState.activePlayers);
    const playersReceivingPenalty = round.attendeeList
      .map(participation => participation.playerId)
      .filter(playerId => playerId !== player._id)

    return this.ngZone.run<Observable<any>>(() => {
      return this.dialogService.openCustomDialog(
        AllPlayerSelectionModalComponent,
        {
          autoFocus: false,
          data: {
            players: activePlayers,
            activatedPlayerIds: playersReceivingPenalty
          }
        }
      ).pipe(
        filter(dialogResult => !!dialogResult),
        tap(dialogResult => {
          const { selectedPlayerIds } = dialogResult;
          return this.store.dispatch(
            new EventsActions.CreateRoundEvents(
              selectedPlayerIds.map(playerId => ({ eventTypeId: SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, playerId, roundId }))
            )
          ).pipe(
            mergeMap(() =>
              this.store.dispatch(new ActiveGameActions.RoundEventAdded(SCHOCK_AUS_STRAFE_EVENT_TYPE_ID, selectedPlayerIds.length))
            )
          ).subscribe();
        })
      );
    });
  }

  private handleStartNewRoundTrigger(player: PlayerDto): Observable<any> {
    return this.ngZone.run<Observable<any>>(() => {
      return this.dialogService.showYesNoDialog({
        title: '',
        message: `${player.name} hat verloren. Wie soll's weitergehen?`,
        buttonConfig: LOST_EVENT_BUTTON_CONFIG
      }).pipe(
        filter((dialogResult: IDialogResult) => dialogResult.result !== DialogResult.ABORT),
        mergeMap((dialogResult: IDialogResult) => {
          if (dialogResult.result === DialogResult.NEW_ROUND) {
            return this.store.dispatch(new ActiveGameActions.StartNewRound());
          } else if (dialogResult.result === DialogResult.FINISH_GAME) {
            const gameId = this.store.selectSnapshot(ActiveGameState.gameId);
            return this.store.dispatch(new GamesActions.Update(gameId, { completed: true }));
          }
        })
      );
    });
  }

  @Action(ActiveGameActions.StartNewRound)
  startNewRound(ctx: StateContext<ActiveGameStateModel>): Observable<any> {
    const gameId = this.store.selectSnapshot(ActiveGameState.gameId);
    const lastRound = this.store.selectSnapshot(ActiveGameState.lastRound);
    return this.store.dispatch(
      new RoundsActions.Create({
        gameId,
        attendeeList: lastRound ? lastRound.attendeeList : []
      })
    );
  }

  @Action(ActiveGameActions.ChangeParticipation)
  changeParticipation(
    ctx: StateContext<ActiveGameStateModel>,
    { playerId, roundId, isParticipating }: ActiveGameActions.ChangeParticipation
  ): Observable<any> {
    const round = this.store.selectSnapshot(ActiveGameState.rounds()).find(round => round._id === roundId);
    if (!round) {
      return EMPTY;
    }

    const attendeeList = isParticipating
      ? [...round.attendeeList, { playerId }]
      : round.attendeeList.filter(att => att.playerId !== playerId);

    return this.store.dispatch(new RoundsActions.Update(roundId, { attendeeList }));
  }

}
