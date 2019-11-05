import { Injectable } from '@angular/core';
import { PlayerDTO } from '@hop-backend-api';
import { PlayerTableItemVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class PlayerTableItemVOMapperService {

  mapToVO(input: PlayerDTO): PlayerTableItemVO {
    const playerVo = new PlayerTableItemVO();
    playerVo.id = input._id;
    playerVo.name = input.name;
    playerVo.active = input.active;
    playerVo.registered = input.registered;
    return playerVo;
  }

  mapToVOs(input: PlayerDTO[]): PlayerTableItemVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
