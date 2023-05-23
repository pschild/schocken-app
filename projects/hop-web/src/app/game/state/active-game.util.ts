import { EventWithType } from '../../state/events';

// tslint:disable-next-line:no-namespace
export namespace ActiveGameUtil {

  export function mapToView(eventWithType: EventWithType): any {
    return {
      eventId: eventWithType.event._id,
      playerId: eventWithType.event.playerId,
      comment: eventWithType.event.comment,
      description: eventWithType.type.description,
      penalty: eventWithType.type.penalty ? eventWithType.type.penalty.value * (eventWithType.event.multiplicatorValue || 1) : undefined,
      unit: eventWithType.type.penalty ? eventWithType.type.penalty.unit : undefined,
    };
  }
}
