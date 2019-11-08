import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PlayerRepository, PlayerDto } from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../../core/service/sort.service';
import { PlayerFormVo } from './player-form/model/player-form.vo';
import { PlayerFormVoMapperService } from './player-form/mapper/player-form-vo-mapper.service';
import { PlayerTableItemVoMapperService } from './player-list/mapper/player-table-item-vo-mapper.service';
import { PlayerTableItemVo } from './player-list/model/player-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class PlayerManagementDataProvider {

  constructor(
    private playerRepository: PlayerRepository,
    private playerTableItemVoMapperService: PlayerTableItemVoMapperService,
    private playerFormVoMapperService: PlayerFormVoMapperService,
    private sortService: SortService
  ) {
  }

  getAll(): Observable<PlayerTableItemVo[]> {
    return this.playerRepository.getAll().pipe(
      map((playerDtos: PlayerDto[]) => playerDtos.sort((a, b) => this.sortService.compare(a, b, 'name', SortDirection.ASC))),
      map((playerDtos: PlayerDto[]) => this.playerTableItemVoMapperService.mapToVos(playerDtos))
    );
  }

  getForEdit(playerId: string): Observable<PlayerFormVo> {
    return this.playerRepository.get(playerId).pipe(
      map((playerDto: PlayerDto) => this.playerFormVoMapperService.mapToVo(playerDto))
    );
  }

  create(data: Partial<PlayerDto>): Observable<string> {
    return this.playerRepository.create(data);
  }

  update(id: string, data: Partial<PlayerDto>): Observable<string> {
    return this.playerRepository.update(id, data);
  }

  removeById(id: string): Observable<string> {
    return this.playerRepository.removeById(id);
  }
}
