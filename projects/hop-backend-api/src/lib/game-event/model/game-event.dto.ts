import { EventDto } from '../../event';

export interface GameEventDto extends EventDto {
  gameId: string;
}
