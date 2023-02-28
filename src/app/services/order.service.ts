import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Orders } from '../models/orders.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends GenericService{
  baseUrl = environment.apiUrl + 'orders';

  constructor(http: HttpClient) {
    super(http);
  }

  getListOrders(): Observable<any> {
    return this.http.get(this.baseUrl + '/list', { headers: this.headers });
  }

  getListOpenOrders(): Observable<any> {
    return this.http.get(this.baseUrl + '/open-orders', { headers: this.headers });
  }

  getOrderById(orderId : number): Observable<any> {
    return this.http.get(this.baseUrl + '/get/' + orderId, { headers: this.headers });
  }

  getOrderByCustomerId(customerId: number): Observable<any> {
    return this.http.get(this.baseUrl + '/GetByCustomerId/' + customerId, { headers: this.headers });
  }

  getByOrderDetailsId(orderDetailsId: number): Observable<any> {
    return this.http.get(this.baseUrl + '/parent-order/' + orderDetailsId, { headers: this.headers });
  }

  getListOrderStatus(): Observable<any> {
    return this.http.get(this.baseUrl + '/statuslist', { headers: this.headers });
  }

  addupdate(order: Orders): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', order, { headers: this.headers });
  }

  upload(formData: FormData, dueDate: Date,client: string): Observable<any>{
    if(client === 'hoffulfill'){
      return this.http.post(this.baseUrl + '/' + client + '/upload?dueDate=' + dueDate.toLocaleString(), formData, {reportProgress: true, observe: 'events'});
    }
    else{
      return this.http.post(this.baseUrl + '/' + client + '/upload', formData, {reportProgress: true, observe: 'events'});
    }
  }




}
