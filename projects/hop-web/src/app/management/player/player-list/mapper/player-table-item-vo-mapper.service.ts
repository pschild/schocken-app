import { Injectable } from '@angular/core';
import { PlayerDto } from '@hop-backend-api';
import { PlayerTableItemVo } from '../model/player-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerTableItemVoMapperService {

  mapToVo(input: PlayerDto): PlayerTableItemVo {
    const vo = new PlayerTableItemVo();
    vo.id = input._id;
    vo.name = input.name;
    vo.active = input.active;
    vo.registered = input.registered;
    return vo;
  }

  mapToVos(input: PlayerDto[]): PlayerTableItemVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
