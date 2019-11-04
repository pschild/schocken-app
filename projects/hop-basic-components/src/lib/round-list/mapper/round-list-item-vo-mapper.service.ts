import { Injectable } from '@angular/core';
import { RoundDTO } from '@hop-backend-api';
import { RoundListItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class RoundListItemVOMapperService {

  mapToVO(input: RoundDTO): RoundListItemVO {
    const roundListVo = new RoundListItemVO();
    roundListVo.id = input._id;
    roundListVo.datetime = input.datetime;
    roundListVo.completed = input.completed;
    return roundListVo;
  }

  mapToVOs(input: RoundDTO[]): RoundListItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
