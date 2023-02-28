import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrdersDetails } from '../models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrderdetailsService extends GenericService {
  baseUrl = environment.apiUrl + 'orderdetails';

  constructor(http: HttpClient) {
    super(http);
  }

  getList(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  addupdate(orderDetails: OrdersDetails): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', orderDetails, { headers: this.headers });
  }

  delete(orderDetailsId: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + orderDetailsId, { headers: this.headers });
  }

}
