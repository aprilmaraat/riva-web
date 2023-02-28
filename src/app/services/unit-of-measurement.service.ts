import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnitOfMeasureService extends GenericService{
  baseUrl = environment.apiUrl + 'unitofmeasure';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any>{
    return this.http.get(this.baseUrl + '/unit-list', { headers: this.headers });
  }
}
