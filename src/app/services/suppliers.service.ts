import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { } from './../models/suppliers.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService extends GenericService {
  baseUrl = environment.apiUrl + 'suppliers';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

}
