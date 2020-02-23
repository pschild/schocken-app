import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EventTypeRepository, EventTypeDto, EventTypeContext } from '@hop-backend-api';
import { map } from 'rxjs/operators';
import { SortService, SortDirection } from '../../core/service/sort.service';
import { EventTypeFormVoMapperService } from './event-type-form/mapper/event-type-form-vo-mapper.service';
import { EventTypeTableItemVoMapperService } from './event-type-list/mapper/event-type-table-item-vo-mapper.service';
import { EventTypeFormVo } from './event-type-form/model/event-type-form.vo';
import { EventTypeTableItemVo } from './event-type-list/model/event-type-table-item.vo';

@Injectable({
  providedIn: 'root'
})
export class EventTypeManagementDataProvider {

  constructor(
    private eventTypeRepository: EventTypeRepository,
    private eventTypeTableItemVoMapperService: EventTypeTableItemVoMapperService,
    private eventTypeFormVoMapperService: EventTypeFormVoMapperService,
    private sortService: SortService
  ) {
  }

  getAllByContext(context: EventTypeContext): Observable<EventTypeTableItemVo[]> {
    return this.eventTypeRepository.findByContext(context).pipe(
      // tslint:disable-next-line:max-line-length
      map((eventTypeDtos: EventTypeDto[]) => eventTypeDtos.sort((a, b) => this.sortService.compare(a, b, 'order', SortDirection.ASC))),
      map((eventTypeDtos: EventTypeDto[]) => this.eventTypeTableItemVoMapperService.mapToVos(eventTypeDtos))
    );
  }

  getForEdit(eventTypeId: string): Observable<EventTypeFormVo> {
    return this.eventTypeRepository.get(eventTypeId).pipe(
      map((eventTypeDto: EventTypeDto) => this.eventTypeFormVoMapperService.mapToVo(eventTypeDto))
    );
  }

  create(data: Partial<EventTypeDto>): Observable<string> {
    return this.eventTypeRepository.create(data);
  }

  update(id: string, data: Partial<EventTypeDto>, skipHistory = false): Observable<string> {
    return this.eventTypeRepository.update(id, data, skipHistory);
  }

  removeById(id: string): Observable<string> {
    return this.eventTypeRepository.removeById(id);
  }
}
