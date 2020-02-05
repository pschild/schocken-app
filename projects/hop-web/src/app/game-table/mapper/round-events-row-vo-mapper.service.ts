import { Injectable } from '@angular/core';
import { RoundDto } from '@hop-backend-api';
import { RoundEventsRowVo } from '../model/round-events-row.vo';
import { RoundEventsColumnVo } from '../model/round-events-column.vo';

@Injectable({
  providedIn: 'root'
})
export class RoundEventsRowVoMapperService {

  mapToVo(round: RoundDto, columns: RoundEventsColumnVo[]): RoundEventsRowVo {
    const vo = new RoundEventsRowVo();
    vo.roundId = round._id;
    vo.attendeeList = round.attendeeList;
    vo.columns = columns;
    return vo;
  }
}
