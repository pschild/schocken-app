export enum EntityType {
    GAME = 'game',
    ROUND = 'round',
    PLAYER = 'player',
    EVENT_TYPE = 'eventType',
    GAME_EVENT = 'gameEvent',
    ROUND_EVENT = 'roundEvent'
}

export interface Entity {
    _id: string;
    type: EntityType;
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

// Statistic, Category, Type, Punishment
export interface EventType extends Entity {
    name: string;
    valueUnit?: string;
    valueStep?: number;
    hasValue?: boolean;
    penalty?: number;
    history?: Array<{date: Date; penalty: number}>;
}

export interface Event extends Entity {
    datetime: Date;
    playerId: string;
    eventTypeId: string;
    eventTypeValue?: number;
}

export interface GameEvent extends Event {
    gameId: string;
}

export interface RoundEvent extends Event {
    roundId: string;
}
