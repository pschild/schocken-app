import { Injectable } from '@angular/core';
import { PlayerDto } from '@hop-backend-api';
import { PlayerFormVo } from '../model/player-form.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerFormVoMapperService {

  mapToVo(input: PlayerDto): PlayerFormVo {
    const vo = new PlayerFormVo();
    vo.id = input._id;
    vo.name = input.name;
    vo.active = input.active;
    vo.registered = input.registered;
    return vo;
  }
}
