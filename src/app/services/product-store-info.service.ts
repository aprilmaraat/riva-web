import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class ProductStoreInfoService extends GenericService{
  baseUrl = environment.apiUrl + 'productsstoreinfo';

  constructor(http: HttpClient) {
    super(http);
  }

  getGroupParents(): Observable<any>{
    let url = this.baseUrl + '/parents';
    return this.http.get<any>(url, { headers: this.headers });
  }
}
