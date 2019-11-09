import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RoundRepository,
} from '@hop-backend-api';

@Injectable({
  providedIn: 'root'
})
export class RoundDataProvider {

  constructor(
    private roundRepository: RoundRepository
  ) {
  }

  getRoundById(roundId: string): Observable<any> {
    return this.roundRepository.get(roundId);
  }
}
