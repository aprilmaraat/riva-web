import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {  ProductsRouting } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsRoutingService extends GenericService {
  baseUrl = environment.apiUrl + 'productsrouting';

  constructor(http: HttpClient) {
    super(http);
  }

  getListCodes(): Observable<any> {
    return this.http.get(this.baseUrl + '/listroutingcodes', { headers: this.headers });
  }

  addupdate(productsRouting: ProductsRouting): Observable<any> {
    return this.http.post(this.baseUrl + '/addupdate', productsRouting, { headers: this.headers });
  }

  delete(findingsID: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + findingsID, { headers: this.headers });
  }

  getRoutingListByProduct(productId : number): Observable<any> {
    return this.http.get(this.baseUrl + '/getbyproduct/' + productId, { headers: this.headers });
  }

}
