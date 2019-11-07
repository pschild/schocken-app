import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventTypeRepository, EventTypeDTO } from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../../core/service/sort.service';
import { EventTypeFormVOMapperService } from './event-type-form/mapper/event-type-form-vo-mapper.service';
import { EventTypeTableItemVOMapperService } from './event-type-list/mapper/event-type-table-item-vo-mapper.service';
import { EventTypeFormVO } from './event-type-form/model/event-type-form.vo';
import { EventTypeTableItemVO } from './event-type-list/model/event-type-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeManagementDataProvider {

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private eventTypeTableItemVOMapperService: EventTypeTableItemVOMapperService,
    private eventTypeFormVOMapperService: EventTypeFormVOMapperService,
    private sortService: SortService
  ) {
  }

  getAll(): Observable<EventTypeTableItemVO[]> {
    return this.eventTypeRepository.getAll().pipe(
      // tslint:disable-next-line:max-line-length
      map((eventTypeDtos: EventTypeDTO[]) => eventTypeDtos.sort((a, b) => this.sortService.compare(a, b, 'description', SortDirection.ASC))),
      map((eventTypeDtos: EventTypeDTO[]) => this.eventTypeTableItemVOMapperService.mapToVOs(eventTypeDtos))
    );
  }

  getForEdit(eventTypeId: string): Observable<EventTypeFormVO> {
    return this.eventTypeRepository.get(eventTypeId).pipe(
      map((eventTypeDto: EventTypeDTO) => this.eventTypeFormVOMapperService.mapToVO(eventTypeDto))
    );
  }

  create(data: Partial<EventTypeDTO>): Observable<string> {
    return this.eventTypeRepository.create(data);
  }

  update(id: string, data: Partial<EventTypeDTO>): Observable<string> {
    return this.eventTypeRepository.update(id, data);
  }

  removeById(id: string): Observable<string> {
    return this.eventTypeRepository.removeById(id);
  }
}
