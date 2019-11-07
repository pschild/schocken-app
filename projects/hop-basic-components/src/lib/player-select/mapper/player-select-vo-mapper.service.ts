import { Injectable } from '@angular/core';
import { PlayerDTO } from '@hop-backend-api';
import { PlayerSelectionVO } from '../model';

@Injectable({
  providedIn: 'root'
})
export class PlayerSelectVOMapperService {

  mapToVO(input: PlayerDTO): PlayerSelectionVO {
    const vo = new PlayerSelectionVO();
    vo.id = input._id;
    vo.name = input.name;
    return vo;
  }

  mapToVOs(input: PlayerDTO[]): PlayerSelectionVO[] {
    return input.map(item => this.mapToVO(item));
  }
}
