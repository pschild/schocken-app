import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigRepository {

  constructor(private http: HttpClient) { }

  load(): Observable<any> {
    return this.http.get('assets/config.json');
  }
}
