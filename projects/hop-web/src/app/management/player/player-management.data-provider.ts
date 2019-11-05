import { Injectable } from '@angular/core';
import { PlayerTableItemVO, PlayerTableItemVOMapperService } from '@hop-basic-components';
import { Observable } from 'rxjs';
import { PlayerRepository, PlayerDTO } from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../../core/service/sort.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerManagementDataProvider {

  constructor(
    private playerRepository: PlayerRepository,
    private playerTableItemVOMapperService: PlayerTableItemVOMapperService,
    private sortService: SortService
  ) {
  }

  getAll(): Observable<PlayerTableItemVO[]> {
    return this.playerRepository.getAll().pipe(
      map((playerDtos: PlayerDTO[]) => playerDtos.sort((a, b) => this.sortService.compare(a, b, 'name', SortDirection.ASC))),
      map((playerDtos: PlayerDTO[]) => this.playerTableItemVOMapperService.mapToVOs(playerDtos))
    );
  }
}
