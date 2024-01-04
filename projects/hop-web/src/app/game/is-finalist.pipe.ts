import { Pipe, PipeTransform } from '@angular/core';
import { RoundDto } from '@hop-backend-api';

@Pipe({
  name: 'isFinalist'
})
export class IsFinalistPipe implements PipeTransform {

  transform(round: RoundDto, playerId: string): boolean {
    return round.finalistIds?.length > 0 && !!round.finalistIds.find(id => id === playerId);
  }

}
