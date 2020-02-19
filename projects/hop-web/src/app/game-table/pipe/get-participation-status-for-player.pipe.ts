import { Pipe, PipeTransform } from '@angular/core';
import { RoundEventsRowVo } from '../model/round-events-row.vo';
import { ParticipationDto } from '@hop-backend-api/lib/round';

@Pipe({
  name: 'getParticipationStatusForPlayer'
})
export class GetParticipationStatusForPlayerPipe implements PipeTransform {

  transform(row: RoundEventsRowVo, playerId: string): boolean {
    return !!row.attendeeList.find((participation: ParticipationDto) => participation.playerId === playerId);
  }

}
