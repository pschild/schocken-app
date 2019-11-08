import { Injectable } from '@angular/core';
import { PlayerDto } from '@hop-backend-api';
import { PlayerSelectionVo } from '../model';

@Injectable({
  providedIn: 'root'
})
export class PlayerSelectVoMapperService {

  mapToVo(input: PlayerDto): PlayerSelectionVo {
    const vo = new PlayerSelectionVo();
    vo.id = input._id;
    vo.name = input.name;
    return vo;
  }

  mapToVos(input: PlayerDto[]): PlayerSelectionVo[] {
    return input.map(item => this.mapToVo(item));
  }
}
