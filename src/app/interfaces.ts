export enum EntityType {
    GAME = 'game',
    ROUND = 'round',
    PLAYER = 'player',
    EVENT_TYPE = 'eventType',
    GAME_EVENT = 'gameEvent',
    ROUND_EVENT = 'roundEvent'
}

export enum EventTypeContext {
    GAME = 'game',
    ROUND = 'round'
}

export interface EventTypePenalty {
    value: number;
    unit: string;
}

export interface Entity {
    _id: string;
    type: EntityType;
    deleted?: boolean;
}

export interface Game extends Entity {
    datetime: Date;
}

export interface Round extends Entity {
    datetime: Date;
    gameId: string;
    participatingPlayerIds?: Array<{playerId: string; inGame: boolean}>;
    currentPlayerId?: string;
}

export interface Player extends Entity {
    registered: Date;
    name: string;
    active: boolean;
}

export interface EventTypeHistoryEntry {
    date: Date;
    eventType: Partial<EventType>;
}

// Statistic, Category, Type, Punishment
export interface EventType extends Entity {
    name: string;
    context: EventTypeContext;
    multiplicatorUnit?: string;
    penalty?: EventTypePenalty;
    history?: Array<EventTypeHistoryEntry>;
    colorCode?: string;
}

export interface Event extends Entity {
    datetime: Date;
    playerId: string;
    eventTypeId: string;
    multiplicatorValue?: number;
}

export interface GameEvent extends Event {
    gameId: string;
}

export interface RoundEvent extends Event {
    roundId: string;
}
