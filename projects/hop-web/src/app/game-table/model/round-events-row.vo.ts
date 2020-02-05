import { RoundEventsColumnVo } from './round-events-column.vo';
import { ParticipationDto } from '@hop-backend-api';

export class RoundEventsRowVo {
  roundId: string;
  attendeeList: ParticipationDto[];
  columns: RoundEventsColumnVo[];
}
