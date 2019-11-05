import { Injectable } from '@angular/core';
import { PlayerDTO } from '@hop-backend-api';
import { PlayerFormVO } from '../model/player-form.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerFormVOMapperService {

  mapToVO(input: PlayerDTO): PlayerFormVO {
    const playerVo = new PlayerFormVO();
    playerVo.id = input._id;
    playerVo.name = input.name;
    playerVo.active = input.active;
    playerVo.registered = input.registered;
    return playerVo;
  }
}
