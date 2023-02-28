import { Injectable } from '@angular/core';
import { GenericService } from './generic.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { GroupItemRequest, Product, ProductsStoreInfo, Productstoreflag } from '../models/product';
import { ProductDetails } from '../models/product-stock';
import { ProductSearch } from '../models/request/product-search-request';
import { Text } from '@angular/compiler/src/render3/r3_ast';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends GenericService{
  baseUrl = environment.apiUrl + 'products';

  constructor(http: HttpClient) {
    super(http);
  }

  // Please don't remove
  getList(): Observable<any> {
    let url = this.baseUrl + '/detail-list';
    return this.http.get<any>(url, { headers: this.headers });
  }

  getSearchList(searchObject: ProductSearch): Observable<any>{
    let url = this.baseUrl + '/list';
    return this.http.post<any>(url, searchObject, { headers: this.headers, responseType: 'text' as 'json'  });
  }

  getProduct(productsId: number): Observable<any>{
    return this.get(productsId, '');
  }

  viewSubassembly(subassemblyId: number): Observable<any>{
    let url = this.baseUrl + '/bom/' + subassemblyId;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getProductDetails(id: number, uom: number, matId: number, size: number): Observable<any>{
    let url = this.baseUrl + '/details/' + id + '?uom=' + uom + '&matId=' + matId + '&size=' + size;
    return this.http.get<any>(url, { headers: this.headers });
  }

  getProductStatuses(): Observable<any>{
    return this.http.get(this.baseUrl + '/productstatuses', { headers: this.headers });
  }

  getProductImages(id: number): Observable<any>{
    return this.http.get(this.baseUrl + '/upload/' + id + '/list', { headers: this.headers });
  }

  saveProduct(object: Product): Observable<any>{
    return this.post(object, '');
  }

  updateProduct(object: Product){
    return this.put(object, '');
  }

  deleteProduct(productsId: number): Observable<any> {
    return this.post(productsId, '/DeleteProduct/' + productsId.toString());
  }

  updatePrimaryImage(object: Product){
    return this.put(object, '/upload/make-primary');
  }

  deleteImage(object: Product){
    return this.put(object, '/upload/delete-image');
  }

  updateProductDetails(productStock: ProductDetails): Observable<any>{
    let url = this.baseUrl + '/details';
    return this.http.put<any>(url, productStock, { headers: this.headers });
  }

  uploadImage(object: FormData): Observable<any>{
    return this.http.post(this.baseUrl + '/upload', object, {reportProgress: true, observe: 'events'});
  }

  // ProductStoreFlag  -- START
  getProductStoreFlag(flagId: number): Observable<any> {
    return this.get(flagId, '/getproductstoreflag');
  }

  saveProductStoreFlag(object: Productstoreflag): Observable<any> {
    return this.post(object, '/inputproductflag');
  }
  // ProductStoreFlag  -- END

  getProductsInfoList(): Observable<any> {
    let url = environment.apiUrl + 'productsinfo/list';
    return this.http.get(url, { headers: this.headers });
  }

  getProductGroupItems(groupId: number): Observable<any> {
    let url = environment.apiUrl + 'productsstoreinfo/product-group/' + groupId;
    return this.http.get(url, { headers: this.headers });
  }

  getNotInGroup(): Observable<any> {
    let url = environment.apiUrl + 'productsstoreinfo/not-in-group';
    return this.http.get(url, { headers: this.headers });
  }

  createGroup(productId: number): Observable<any>{
    let url = environment.apiUrl + 'productsstoreinfo/create-group/';
    return this.http.post(url, productId, { headers: this.headers });
  }

  addToGroup(storeInfo: ProductsStoreInfo): Observable<any>{
    let url = environment.apiUrl + 'productsstoreinfo/add-to-group/';
    return this.http.post(url, storeInfo, { headers: this.headers });
  }

  updateGroupItems(groupItems: GroupItemRequest): Observable<any>{
    let url = environment.apiUrl + 'productsstoreinfo/update-group-items/';
    return this.http.post(url, groupItems, { headers: this.headers });
  }

  reorderGroupItem(productId: number, groupId: number, groupLevel: number): Observable<any> {
    let url = environment.apiUrl + 'productsstoreinfo/reorder-item/'+productId+'/'+groupId+'/'+groupLevel
    return this.http.get(url, { headers: this.headers });
  }

  removeFromGroup(productId: number): Observable<any>{
    let url = environment.apiUrl + 'productsstoreinfo/remove-from-group/'+productId;
    return this.http.delete(url, { headers: this.headers });
  }

  removeAllFromGroup(productId: number): Observable<any>{
    let url = environment.apiUrl + 'productsstoreinfo/remove-all-from-group/'+productId;
    return this.http.delete(url, { headers: this.headers });
  }

  lastupdate(id: number): Observable<any> {
    return this.http.get(this.baseUrl + '/lastupdate/' + id.toString(), { headers: this.headers });
  }

}
