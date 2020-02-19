import { EntityDto } from '../../entity/model/entity.dto';
import { ParticipationDto } from './participation.dto';

export interface RoundDto extends EntityDto {
  datetime: Date;
  gameId: string;
  currentPlayerId: string;
  attendeeList: ParticipationDto[];
}
