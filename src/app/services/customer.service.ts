import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Customers } from './../models/customer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends GenericService{
  baseUrl = environment.apiUrl + 'customer';

  constructor(http: HttpClient) {
    super(http);
  }

  addupdate(customer: Customers): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', customer, { headers: this.headers });
  }


}
