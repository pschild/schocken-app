import { Pipe, PipeTransform } from '@angular/core';
import { RoundDto } from '@hop-backend-api';

@Pipe({
  name: 'isParticipating'
})
export class IsParticipatingPipe implements PipeTransform {

  transform(round: RoundDto, playerId: string): boolean {
    return !!round.attendeeList.find(participation => participation.playerId === playerId);
  }

}
