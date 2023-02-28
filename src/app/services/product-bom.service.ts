import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductsBOM } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductBomService extends GenericService{

  baseUrl = environment.apiUrl + 'products/bill-of-materials';

  constructor(http: HttpClient) {
    super(http);
  }

  getProductBomList(productsId: number): Observable<any>{
    let url = this.baseUrl + '/' + productsId + '/list';
    return this.http.get<any>(url, { headers: this.headers });
  }

  getTableAList(productId: number) {
    let url = this.baseUrl + '/table-a-list/' + productId;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getTableAOptions() {
    let url = this.baseUrl + '/table-a-options/';
    return this.http.get<any>(url, { headers: this.headers });
  }

  getFabMethods() {
    let url = this.baseUrl + '/fab-methods/';
    return this.http.get<any>(url, { headers: this.headers });
  }

  getTableBList(productId: number) {
    let url = this.baseUrl + '/table-b-list/' + productId;
    return this.http.get<any>(url, { headers: this.headers });
  }

  addUpdate(bom: ProductsBOM): Observable<any>{
    let url = this.baseUrl;
    return this.http.post(url, bom, { headers: this.headers });
  }

}