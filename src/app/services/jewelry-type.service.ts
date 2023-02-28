import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JewelryTypeService extends GenericService {
  baseUrl = environment.apiUrl + 'jewelrytype';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any>{
    return this.http.get(this.baseUrl + '/jewelrytype-list', { headers: this.headers });
  }
}
