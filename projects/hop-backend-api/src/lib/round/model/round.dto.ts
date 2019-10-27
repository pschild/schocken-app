import { EntityDTO } from '../../entity/model/entity.dto';

export interface RoundDTO extends EntityDTO {
  datetime: Date;
  gameId: string;
  currentPlayerId: string;
  // attendanceList: Participation[];
  completed: boolean;
}
