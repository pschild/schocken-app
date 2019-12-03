import { RoundListItemVo } from '@hop-basic-components';

export class GameDetailsVo {
  id: string;
  datetime: Date;
  completed: boolean;
  rounds: RoundListItemVo[];
  latestRound: RoundListItemVo;
}
