import { Component, OnInit } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Game, Round, RoundEvent, EventType, EntityType, Player, EventTypeContext, EventTypePenalty } from '../interfaces';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import { AppConfigService } from '../app-config.service';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss']
})
export class PlaygroundComponent implements OnInit {

  db = null;
  allGames$: Observable<Game[]>;
  allRounds$: Observable<Round[]>;
  allRoundEvents$: Observable<RoundEvent[]>;
  allEventTypes$: Observable<EventType[]>;
  allPlayers$: Observable<Player[]>;
  chosenGameId: string;
  chosenRoundId: string;
  chosenRoundEventId: string;
  chosenEventTypeId: string;
  chosenPlayerId: string;
  eventTypeName: string;
  playerName: string;
  context: EventTypeContext = EventTypeContext.ROUND;
  valueUnit: string;
  penalty: EventTypePenalty;
  versionInfo: string;
  isCancelled: string;

  constructor(private appConfig: AppConfigService) {
    this.db = new PouchDB('dummy');
    this.loadAllGames();
    this.loadAllRounds();
    this.loadAllRoundEvents();
    this.loadAllEventTypes();
    this.loadAllPlayers();

    this.penalty = { value: 1, unit: '€' };

    this.versionInfo = localStorage.getItem('versionInfo');
    this.isCancelled = localStorage.getItem('cancelled');

    // this.db.query((doc, emit) => {
    //   if (doc.type === EntityType.ROUND) {
    //     if (doc.gameId === 'game-e8299429-3490-4f29-9f87-6e79d54b0d9d') {
    //       emit(doc.datetime, null);
    //     }
    //   }
    // }, {
    //   include_docs: true
    // }).then(res => console.log(res));
    // this.db.find({
    //   selector: { type: 'round', gameId: 'game-e8299429-3490-4f29-9f87-6e79d54b0d9d' },
    //   fields: ['_id'],
    //   sort: ['datetime']
    // }).then(r => console.log(r));
  }

  ngOnInit() {
  }

  loadAllGames() {
    this.allGames$ = from(this.db.allDocs({
      include_docs: true,
      startkey: 'game-',
      endkey: 'game-\ufff0'
    })) as Observable<Game[]>;
  }

  loadAllRounds() {
    this.allRounds$ = from(this.db.allDocs({
      include_docs: true,
      startkey: 'round-',
      endkey: 'round-\ufff0'
    })) as Observable<Round[]>;
  }

  loadAllRoundEvents() {
    this.allRoundEvents$ = from(this.db.allDocs({
      include_docs: true,
      startkey: 'roundEvent-',
      endkey: 'roundEvent-\ufff0'
    })) as Observable<RoundEvent[]>;
  }

  loadAllEventTypes() {
    this.allEventTypes$ = from(this.db.allDocs({
      include_docs: true,
      startkey: 'eventType-',
      endkey: 'eventType-\ufff0'
    })) as Observable<EventType[]>;
  }

  loadAllPlayers() {
    this.allPlayers$ = from(this.db.allDocs({
      include_docs: true,
      startkey: 'player-',
      endkey: 'player-\ufff0'
    })) as Observable<Player[]>;
  }

  newGame() {
    const game: Game = { _id: `game-${Math.floor(Math.random() * 100000)}`, type: EntityType.GAME, datetime: new Date() };
    this.db.put(game, (err, result) => {
      console.log(err, result);
      this.loadAllGames();
    });
  }

  removeGame(game: Game) {
    this.db.remove(game)
      .then(r => {
        console.log(r);
        this.loadAllGames();
      }).catch(err => {
        console.log(err);
      });
  }

  newRound() {
    const round: Round = { _id: `round-${Math.floor(Math.random() * 100000)}`, type: EntityType.ROUND, datetime: new Date(), gameId: this.chosenGameId };
    this.db.put(round, (err, result) => {
      console.log(err, result);
      this.loadAllRounds();
    });
  }

  removeRound(round: Round) {
    this.db.remove(round)
      .then(r => {
        console.log(r);
        this.loadAllRounds();
      }).catch(err => {
        console.log(err);
      });
  }

  newRoundEvent() {
    const roundEvent: RoundEvent = { _id: `roundEvent-${Math.floor(Math.random() * 100000)}`, type: EntityType.ROUND_EVENT, roundId: this.chosenRoundId, eventTypeValue: 42, playerId: '1', eventTypeId: this.chosenEventTypeId, datetime: new Date() };
    this.db.put(roundEvent, (err, result) => {
      console.log(err, result);
      this.loadAllRoundEvents();
    });
  }

  updateRoundEvent(roundEventId, type) {
    this.db.get(roundEventId)
      .then(doc => {
        if (type === 'inc') {
          return this.db.put(Object.assign(doc, { value: +doc.value + 1 }));
        } else {
          return this.db.put(Object.assign(doc, { value: +doc.value - 1 }));
        }
      }).then(result => {
        console.log(result);
        this.loadAllRoundEvents();
      }).catch(err => {
        console.log(err);
      });
  }

  updateRoundEventCb(roundEventId, event) {
    this.db.get(roundEventId)
      .then(doc => {
        return this.db.put(Object.assign(doc, { value: event.srcElement.checked }));
      }).then(result => {
        console.log(result);
        this.loadAllRoundEvents();
      }).catch(err => {
        console.log(err);
      });
  }

  removeRoundEvent(event: RoundEvent) {
    this.db.remove(event)
      .then(r => {
        console.log(r);
        this.loadAllRoundEvents();
      }).catch(err => {
        console.log(err);
      });
  }

  newEventType() {
    const eventType: EventType = {
      _id: `eventType-${Math.floor(Math.random() * 100000)}`,
      type: EntityType.EVENT_TYPE,
      name: this.eventTypeName,
      context: this.context,
      valueUnit: this.valueUnit,
      penalty: this.penalty
    };
    if (this.penalty) {
      eventType.history = [{
        date: new Date(),
        penalty: this.penalty
      }];
    }
    this.db.put(eventType, (err, result) => {
      console.log(err, result);
      this.loadAllEventTypes();
    });
  }

  removeEventType(type: EventType) {
    this.db.remove(type)
      .then(r => {
        console.log(r);
        this.loadAllEventTypes();
      }).catch(err => {
        console.log(err);
      });
  }

  newPlayer() {
    const player: Player = { _id: `player-${Math.floor(Math.random() * 100000)}`, type: EntityType.PLAYER, name: this.playerName, active: true, registered: new Date() };
    this.db.put(player, (err, result) => {
      console.log(err, result);
      this.loadAllPlayers();
    });
  }

  saveVi() {
    localStorage.setItem('versionInfo', this.versionInfo);
  }

  saveCa() {
    localStorage.setItem('cancelled', this.isCancelled);
  }

}
