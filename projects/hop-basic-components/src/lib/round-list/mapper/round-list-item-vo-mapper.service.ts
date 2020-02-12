import { Injectable } from '@angular/core';
import { RoundDto } from '@hop-backend-api';
import { RoundListItemVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class RoundListItemVoMapperService {

  mapToVo(input: RoundDto): RoundListItemVo {
    const vo = new RoundListItemVo();
    vo.id = input._id;
    vo.datetime = input.datetime;
    return vo;
  }

  mapToVos(input: RoundDto[]): RoundListItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
